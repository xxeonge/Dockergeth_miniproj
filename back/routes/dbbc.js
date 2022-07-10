var express = require('express');
var router = express.Router();
var web3 = require('../contracts/web3')
var logger = require('../config/logger')
var complieBox = require('../build/contracts/HybridBox.json')
var compileAuction = require('../build/contracts/HybridAuction.json')
/* Database */
const pool = require('./pool.js')

/* current time */
const moment = require('moment')
require('moment-timezone')
moment.tz.setDefault("Asia/Seoul")

// 경매 등록
router.post('/register', async (req, res, next) => {
    let client_request = moment().format('x')  //client request time\
    var date = moment().format('YYYY-MM-DD HH:mm:ss');
    const user_id = req.body.user_id
    const close_date = req.body.product.date + " " + req.body.product.time
    const auctionOwner = req.body.auctionOwner
    const boxAddress = req.body.boxAddress
    console.log(user_id,close_date,auctionOwner,boxAddress)
    let product = {
        'category_code' : req.body.product.category,
        'status_code': 1,
        'name' : req.body.product.name,
        'start_date' : date,
        'close_date' : close_date,
        'reserve_price' : req.body.product.price,
        'img_url' : req.body.product.img_url,
        'description' : req.body.product.description,
        'contract' : req.body.product.contract
    };

    try {
        const connection = await pool.getConnection(async conn=>conn)
        try {
            await connection.beginTransaction()
            var t0 = moment()
            await connection.query('INSERT INTO auction_items SET user_id=?, ?', [user_id, product])
            var t1 = moment()
            var arroundtime = moment.duration(t1.diff(t0)).asSeconds()
            logger.info(`${client_request},${moment(t0).format('x')},${auctionOwner},insertAuction,DB,${arroundtime}`)
            
            const item_id = 1
            const box = new web3.eth.Contract(complieBox.abi,boxAddress)
            

            t0 = moment()
            const result = await box.methods.createAuction(item_id).send({from:auctionOwner, gas:0x47b760}) //gas genesis
            t1 = moment()
            arroundtime = moment.duration(t1.diff(t0)).asSeconds()
            logger.info(`${client_request},${moment(t0).format('x')},${auctionOwner},generateAuction,BC,${arroundtime}`)

            const auctionAddress = result['events']['AuctionCreated']['returnValues']['auctionContract']
            product.contract = auctionAddress
            
            //update auction address (DB)
            t0 = moment()
            await connection.query('UPDATE auction_items SET contract=? WHERE item_id=?',[auctionAddress,item_id])
            t1 = moment()
            arroundtime = moment.duration(t1.diff(t0)).asSeconds()
            logger.info(`${client_request},${moment(t0).format('x')},${auctionOwner},updateAuction,DB,${arroundtime}`)

            await connection.query('create event if not exists event_? on schedule at ? on completion not preserve enable do update auction_items set status_code=2 where item_id=?', [item_id, close_date, item_id])
            await connection.commit()
            connection.release()
            
            return res.json({
                success: true,  // 성공
                item_id: item_id,   // 경매 번호
                product: product,   // 경매 정보 (딕셔 너리)
                owner_id: user_id,  // 오너 고유번호
                owner_account: auctionOwner  // 오너 계약주소
            })

        } catch(err) {
            await connection.rollback()
            connection.release()
            throw err
        }
    } catch(err) {
        logger.error(err)     
        res.json({
            success: false,
            message: 'connection error'
        })
    }
});

// 경매 참여
router.post('/participate', async (req, res, next) => {
    var client_request = moment().format('x')
    
    const info = {
        'item_id': req.body.participate.item_id,
        'user_id': req.body.participate.user_id
    }
    const price = req.body.participate.price // 최종 낙찰가
    const AuctionParticipate = req.body.participate.user_ganache
    const wei_price = web3.utils.toWei(price.toString(), 'Gwei')

    try {
        const connection = await pool.getConnection(async conn=>conn)
        try {
            const [item_list] = await connection.query('SELECT * FROM auction_items WHERE item_id=?', info.item_id) // 경매 상태코드 검사
            const item = item_list[0]

            if (item.status_code != 1) {
                connection.release()
                return res.json({
                    success: false,
                    message: 'rigged request'
                })
            }

            const auction = new web3.eth.Contract(compileAuction.abi,item.contract)
        
            var t0 = moment()
            const result = await auction.methods.receiveDeposit().send({
                from: AuctionParticipate,
                value: wei_price,
                gas: 0x47b760
            })
            var t1 = moment()
            var arroundtime = moment.duration(t1.diff(t0)).asSeconds()
            logger.info(`${client_request},${moment(t0).format('x')},${AuctionParticipate},participatePay,BC,${arroundtime}`)
            
            t0 = moment()
			await connection.query('INSERT INTO participants SET ?, address=?', [info, AuctionParticipate])
            t1 = moment()
            arroundtime = moment.duration(t1.diff(t0)).asSeconds()
            logger.info(`${client_request},${moment(t0).format('x')},${AuctionParticipate},participateInfo,DB,${arroundtime}`) 


            const [rows2] = await connection.query('SELECT LAST_INSERT_ID() as pk')
            const participant_id = rows2[0].pk
			connection.release()
			return res.json({
               success: true,
               message: 'auction participate success',
               participant_id: participant_id
           })
        } catch(err) {
            connection.release()
            throw err
        }
    } catch(err) {
        logger.error(err)
        
        return res.json({
            success: false,
            message: 'connection error'
        })
    }

})

// 입찰
router.post('/bid', async (req, res, next) => {
    var client_request = moment().format('x')

    const info = {
        'user_id': req.body.user_id,
        'item_id': req.body.item_id,
        'participant_id': req.body.participant_id
    };
    const AuctionParticipate = req.body.user_ganache

    try {
        const connection = await pool.getConnection(async conn=>conn)
        try {
            const [item] = await connection.query('SELECT status_code FROM auction_items WHERE item_id=?', info.item_id) // 경매 상태코드 검사

            // 조작된 요청 (경매 상태코드 1 - 'ongoing' 상태가 아닐 때)
            if (item[0].status_code != 1) {
                connection.release()
                //logger.info('bid:if-1')
                return res.json({
                    success: false,
                    message: 'rigged request'
                })
            }
            

            let timestamp = moment().format('YYYY-MM-DD HH:mm:ss')
            var t0 = moment()
            const [rows2] = await connection.query('SELECT * from auction_items where item_id=?', info.item_id)
            /* filtering */
            if (timestamp >= rows2[0].close_date) {   // fail : 경매 마감 시간이 지난 후 입찰
                var t1 = moment()
                var arroundtime = moment.duration(t1.diff(t0)).asSeconds()
                logger.info(`${client_request},${moment(t0).format('x')},${user_id},bidFail,DB,${arroundtime}`)
                connection.release()
                return res.json({
                    success: false,
                    message: 'auction closed'
                })
            }

            t0 = moment()
            const [rows3] = await connection.query('SELECT value FROM highests WHERE item_id=?', info.item_id)
            var t1 = moment()
            arroundtime = moment.duration(t1.diff(t0)).asSeconds()
            logger.info(`${client_request},${moment(t0).format('x')},${AuctionParticipate},checkHighestBid_1,DB,${arroundtime}`)

            let max_bid= 0
            if (rows3.length>0) {
                max_bid = rows3[0].value
            }        
            var value = max_bid +1

            /* 거래 시작 */
            try {
                timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
                await connection.beginTransaction()
                
                t0 = moment()
                await connection.query('INSERT INTO bids SET timestamp=?, ?, value=?', [timestamp, info, value])
                if (!max_bid) {
                    await connection.query('INSERT INTO highests SET timestamp=?, ?, value=?', [timestamp, info, value])
                } else {
                    await connection.query('UPDATE highests SET timestamp=?, user_id=?, participant_id=?, value=? WHERE item_id=?', [timestamp, info.user_id, info.participant_id, value, info.item_id])
                }
                t1 = moment()
                arroundtime = moment.duration(t1.diff(t0)).asSeconds()
                logger.info(`${client_request},${moment(t0).format('x')},${AuctionParticipate},bid,DB,${arroundtime}`)

                await connection.commit()

                connection.release()
                res.json({
                    success: true,
                    message: 'bidding success'
                })
            } catch(err) {
                await connection.rollback()
                connection.release()
                throw err
            }
        } catch(err) {
            connection.release()
            throw err
        }
    } catch(err) {
        logger.error(err)
        
        return res.json({
            success: false,
            message: 'connection error'
        })
    }
})

// 낙찰자 여부 true false
router.post('/winner', async (req,res,next) => {
    var client_request = moment().format('x')

    const item_id = req.body.item_id
    const user_id = req.body.user_id
    const AuctionParticipate = req.body.user_ganache

    try {
        const connection = await pool.getConnection(async conn=>conn)
        try {

            var t0 = moment()
            const [item] = await connection.query('SELECT user_id FROM highests WHERE item_id=?', item_id)
            var t1 = moment()
            var arroundtime = moment.duration(t1.diff(t0)).asSeconds()
            logger.info(`${client_request},${moment(t0).format('x')},${AuctionParticipate},checkHighestBidder,DB,${arroundtime}`)
            
            let flag = false
            if (user_id == item[0].user_id) {
                flag = true
            }
            connection.release()
            return res.json({
                success: true,
                winner: flag
            })
        } catch(err) {
            connection.release()
            throw err
        }
    } catch(err) {
        logger.error(err)
        
        return res.json({
            success: false,
            message: 'connection error'
        })
    }
})

/* 낙찰 */
router.post('/successful', async (req, res, next) => {
    var client_request = moment().format('x')
    const item_id = req.body.item_id
    const user_id  = req.body.user_id
    const participant_id = req.body.participant_id
    const winner = req.body.user_ganache
     try {
        const connection = await pool.getConnection(async conn=>conn)
        try {
            const [item_list] = await connection.query('SELECT status_code, contract FROM auction_items WHERE item_id=?', item_id) // 경매 상태코드 검사
            const item = item_list[0]
            if (item.status_code != 2) {
                logger.info("successful:hi-if1")
                connection.release()
                return res.json({
                    success: false,
                    message: 'rigged request - wrong status code'
                })
            }

            var t0 = moment()
            const [rows] = await connection.query('SELECT * FROM highests WHERE item_id=?', item_id) // 낙찰자 탐색 
            var t1 = moment()
            var arroundtime = moment.duration(t1.diff(t0)).asSeconds()
            logger.info(`${client_request},${moment(t0).format('x')},${winner},checkHighestBid_2,DB,${arroundtime}`)

            const price = await web3.utils.toWei(rows[0].value.toString(),'Gwei') // 최종 낙찰가


            // 낙찰자 잔액 부족 처리
            t0 = moment()
            const winner_balarnce = await web3.eth.getBalance(winner)
            t1 = moment()
            arroundtime = moment.duration(t1.diff(t0)).asSeconds()
            logger.info(`${client_request},${moment(t0).format('x')},${winner},getBalance,BC,${arroundtime}`)

            const contract = item.contract   // 경매 계약주소

            try {
                await connection.beginTransaction()

                const auction = new web3.eth.Contract(compileAuction.abi,item.contract)
                
                t0 = moment()
                const successfulBid = await auction.methods.successfulBid().send({
                    from: winner,
                    value: price,
                    gas: 0x47b760
                }).catch (err => {
                    t1 = moment()
                    arroundtime = moment.duration(t1.diff(t0)).asSeconds()
                    logger.info(`${client_request},${moment(t0).format('x')},${winner},bidSuccessFail,BC,${arroundtime}`)
                    throw err
                })
                t1 = moment()
                arroundtime = moment.duration(t1.diff(t0)).asSeconds()
                logger.info(`${client_request},${moment(t0).format('x')},${winner},bidSuccessPay,BC,${arroundtime}`)

                t0 = moment()
                await connection.query('UPDATE highests SET winning_flag=1 WHERE item_id=?', item_id)
                t1 = moment()
                arroundtime = moment.duration(t1.diff(t0)).asSeconds()
                logger.info(`${client_request},${moment(t0).format('x')},${winner},bidSuccessInfo,DB,${arroundtime}`)

                await connection.commit()
                connection.release()
                return res.json({
                    success: true
                })
            } catch(err) {
                await connection.rollback()
                connection.release()
                throw err
            }
        } catch(err) {
            connection.release()
            throw err
        }
    } catch(err) {
        logger.error(err)
        
        return res.json({
            success: false,
            message: 'connection error'
        })
    }
})


/* 낙찰 후 보증금 환불 */
router.post('/withdraw', async (req, res, next) => {
    var client_request = moment().format('x')
    const item_id = req.body.item_id
    const participant_id = req.body.participant_id
    const user_ganache = req.body.user_ganache

    try {
        const connection = await pool.getConnection(async conn=>conn)
        try {
            const [item] = await connection.query('SELECT * FROM auction_items WHERE item_id=?', item_id) // 경매 상태코드 검사

            // 조작된 요청 (경매 상태코드 2 - 'ended' 상태가 아닐 때)
            if ((item[0].status_code != 2) && (item[0].status_code != 4)) {
                connection.release()
                return res.json({
                    success: false,
                    message: 'rigged request - wrong item status'
                })
            }
            
            /* 거래 시작 */
            try {
                const auction = new web3.eth.Contract(compileAuction.abi,item[0].contract)

                var t0 = moment()
                const refundDeposit = await auction.methods.refundDeposit().send({
                    from: user_ganache,
                    gas: 0x47b760
                })
                var t1 = moment()
                var arroundtime = moment.duration(t1.diff(t0)).asSeconds()
                logger.info(`${client_request},${moment(t0).format('x')},${user_ganache},depositRefund,BC,${arroundtime}`)

                t0 = moment()
                await connection.query('UPDATE participants SET refund_flag=1 where participant_id=?', participant_id)    // 환불 플래그
                t1 = moment()
                arroundtime = moment.duration(t1.diff(t0)).asSeconds()
                logger.info(`${client_request},${moment(t0).format('x')},${user_ganache},refundInfo,DB,${arroundtime}`)


                // 남은 참여자 없을 시 상태 코드 업데이트 (3-'ended')
                const [rows3] = await connection.query('SELECT user_id FROM participants WHERE item_id=? and refund_flag=0', item_id)
                if (rows3.length == 0) {
                    await connection.query('UPDATE auction_items SET status_code=3 WHERE item_id=?', item_id)
                }
                // await connection.commit()
                connection.release()
                return res.json({
                   success: true
                })
            } catch (err) {
                // await connection.rollback()
                connection.release()
                throw err
            }
        } catch(err) {
            connection.release()
            throw err
        }
    } catch(err) {
        logger.error(err)

        const errType = err.toString()
        const deadFlag = false

        if (errType.includes("Deadlock")) {
            deadFlag = true    
        }
        return res.json({
            success: false,
            message: 'connection error',
            deadlock: deadFlag
        })
    }
})

module.exports = router