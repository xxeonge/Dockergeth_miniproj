// Database 100% Version API
// API 사용법 -> ex : http://localhost:3000/api/db/example

var express = require('express');
var router = express.Router();
var axios = require('axios')
var logger = require('../config/logger')

/* Database */
const pool = require('./pool.js')

/* current time */
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");


// 경매 등록
router.post('/register', async(req, res, next) => {
    let client_request = moment().format('x')  //client request time
    var date = moment().format('YYYY-MM-DD HH:mm:ss');

    const user_id = req.body.user_id
    const close_date = req.body.product.date + " " + req.body.product.time

    const product = {
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
            var t0 = moment()
            await connection.query('INSERT INTO auction_items SET user_id=?, ?', [user_id, product])
            var t1 = moment()
            var arroundtime = moment.duration(t1.diff(t0)).asSeconds()
            logger.info(`${client_request},${moment(t0).format('x')},${user_id},insertAuction,DB,${arroundtime}`)
            
            await connection.query('create event if not exists event_? on schedule at ? on completion not preserve enable do update auction_items set status_code=2 where item_id=?', [1, close_date, 1])

            connection.release()
            return res.json({
                success: true,  // 성공
                item_id: 1,   // 경매 번호
                product: product,   // 경매 정보 (딕셔너리)
                owner_id: user_id,  // 오너 고유번호
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
});

// 경매 참여
router.post('/participate', async (req, res, next) => {
    let client_request = moment().format('x')  //client request time

    const info = {
        'item_id': req.body.participate.item_id,
        'user_id': req.body.participate.user_id
    }

    let price = 1
    
    try {
        const connection = await pool.getConnection(async conn=>conn)
        try {
            const [item] = await connection.query('SELECT status_code, contract FROM auction_items WHERE item_id=?', info.item_id) // 경매 상태코드 검사
            // 조작된 요청 (경매 상태 1 - 'ongoing' 상태가 아닐 때)
            if (item[0].status_code != 1) {
                connection.release()
                return res.json({
                    success: false,
                    message: 'rigged request'
                })
            }
            
            /* 거래 시작 */
            try {
                await connection.beginTransaction()
                var t0 = moment()
                await connection.query('UPDATE users SET balance=balance-? where user_id=?', [price, info.user_id])    // 사용자 잔액 차감
                await connection.query('UPDATE users SET balance=balance+? where user_id=500', price) // 관리자에게 보증금 입금
                var t1 = moment()
                var arroundtime = moment.duration(t1.diff(t0)).asSeconds()
                logger.info(`${client_request},${moment(t0).format('x')},${info.user_id},participatePay,DB,${arroundtime}`)

                t0 = moment()
                await connection.query('INSERT INTO participants SET ?', info)
                t1 = moment()
                arroundtime = moment.duration(t1.diff(t0)).asSeconds()
                logger.info(`${client_request},${moment(t0).format('x')},${info.user_id},participateInfo,DB,${arroundtime}`)

                const [rows] = await connection.query('SELECT LAST_INSERT_ID() as pk')
                const participant_id = rows[0].pk

                // 거래 기록
                // const timestamp = moment().format('YYYY-MM-DD HH:mm:ss')
                // const transaction = {
                //     "from_id": info.user_id,
                //     "to_id": 500,
                //     "value": price,
                //     "timestamp": timestamp
                // }
                // await connection.query('INSERT INTO transactions SET ?', transaction)

                await connection.commit()
                connection.release()
                return res.json({
                    success: true,
                    message: 'auction participate success',
                    participant_id: participant_id
                })   
            } catch (err) {
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

// 입찰
router.post('/bid', async (req, res, next) => {
    let client_request = moment().format('x')  //client request time

    const info = {
        'user_id': req.body.user_id,
        'item_id': req.body.item_id,
        'participant_id': req.body.participant_id
    };

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
                logger.info(`${client_request},${moment(t0).format('x')},${info.user_id},bidFail,DB,${arroundtime}`)
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
            logger.info(`${client_request},${moment(t0).format('x')},${info.user_id},checkHighestBid_1,DB,${arroundtime}`)
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
                logger.info(`${client_request},${moment(t0).format('x')},${info.user_id},bid,DB,${arroundtime}`)

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
    let client_request = moment().format('x')
    const item_id = req.body.item_id
    const user_id = req.body.user_id

    try {
        const connection = await pool.getConnection(async conn=>conn)
        try {
            var t0 = moment()
            const [item] = await connection.query('SELECT user_id FROM highests WHERE item_id=?', item_id)
            var t1 = moment()
            var arroundtime = moment.duration(t1.diff(t0)).asSeconds()
            logger.info(`${client_request},${moment(t0).format('x')},${user_id},checkHighestBidder,DB,${arroundtime}`)
            let flag = false;
            if (user_id == item[0].user_id) {
                flag = true;
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

// 낙찰
router.post('/successful', async (req, res, next) => {
    let client_request = moment().format('x')

    const item_id = req.body.item_id
    const user_id  = req.body.user_id

    try {
        const connection = await pool.getConnection(async conn=>conn)
        try {
            const [item] = await connection.query('SELECT status_code, reserve_price FROM auction_items WHERE item_id=?', item_id) // 경매 상태코드 검사

            // 조작된 요청 (경매 상태코드 2 - 'closed' 상태가 아닐 때)
            if (item[0].status_code != 2) {
                connection.release()
                return res.json({
                    success: false,
                    message: 'rigged request - wrong item status'
                })
            }
            var t0 = moment()
            const [rows] = await connection.query('SELECT * FROM highests WHERE item_id=?', item_id) // 낙찰자 탐색 
            var t1 = moment()
            var arroundtime = moment.duration(t1.diff(t0)).asSeconds()
            logger.info(`${client_request},${moment(t0).format('x')},${user_id},checkHighestBid_2,DB,${arroundtime}`)

    
            const bid_id = rows[0].bid_id
            const winner_id = rows[0].user_id // 낙찰자
            const price = rows[0].value // 최종 낙찰가

            t0 = moment()
            const [rows2] = await connection.query('SELECT balance FROM users where user_id=?', user_id)
            t1 = moment()
            arroundtime = moment.duration(t1.diff(t0)).asSeconds()
            logger.info(`${client_request},${moment(t0).format('x')},${user_id},getBalance,DB,${arroundtime}`)
            const balance = rows2[0].balance    // 낙찰자 잔액

            const [rows3] = await connection.query('SELECT user_id FROM auction_items WHERE item_id=?', item_id)
            const owner_id = rows3[0].user_id  // 경매 오너

            /* 거래 시작 */
            try {
                await connection.beginTransaction()
                t0 = moment()
                await connection.query('UPDATE users SET balance=balance-? where user_id=?', [price, user_id])    // 낙찰자 잔액 차감
                await connection.query('UPDATE users SET balance=balance+? where user_id=?', [price, owner_id]) // 오너에게 낙찰금액 입금
                t1 = moment()
                arroundtime = moment.duration(t1.diff(t0)).asSeconds()
                logger.info(`${client_request},${moment(t0).format('x')},${user_id},bidSuccessPay,BC,${arroundtime}`)  

                t0 = moment()
                await connection.query('UPDATE highests SET winning_flag=1 WHERE item_id=?', item_id)
                t1 = moment()
                arroundtime = moment.duration(t1.diff(t0)).asSeconds()
                logger.info(`${client_request},${moment(t0).format('x')},${user_id},bidSuccessInfo,BC,${arroundtime}`)  

  
                /* 거래 기록 */
                // const timestamp = moment().format('YYYY-MM-DD HH:mm:ss')
                // const transaction = {
                //     "from_id": winner_id,
                //     "to_id": owner_id,
                //     "value": price,
                //     "timestamp": timestamp
                // }
                // await connection.query('INSERT INTO transactions SET ?', transaction);

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
    let client_request = moment().format('x')

    const item_id = req.body.item_id
    const user_id = req.body.user_id
    const participant_id = req.body.participant_id

    try {
        const connection = await pool.getConnection(async conn=>conn)
        try {
            const [item] = await connection.query('SELECT * FROM auction_items WHERE item_id=?', item_id) // 경매 상태코드 검사

            // 조작된 요청 (경매 상태코드 2-'closed' 혹은 4-'corrupted' 상태가 아닐 때)
            if ((item[0].status_code != 2) && (item[0].status_code != 4)) {
                connection.release()
                return res.json({
                    success: false,
                    message: 'rigged request - wrong item status'
                })
            }

            const r_price = item[0].reserve_price // 환불 금액

            /* 거래 시작 */
            try {
                //await connection.beginTransaction()
                var t0 = moment()
                await connection.query('UPDATE users SET balance=balance-? where user_id=500', r_price) // 관리자 잔액 차감
                await connection.query('UPDATE users SET balance=balance+? where user_id=?', [r_price, user_id])    // 사용자 보증금 입금
                var t1 = moment()
                var arroundtime = moment.duration(t1.diff(t0)).asSeconds()
                logger.info(`${client_request},${moment(t0).format('x')},${user_id},depositRefund,BC,${arroundtime}`)

                t0 = moment()
                await connection.query('UPDATE participants SET refund_flag=1 where participant_id=?', participant_id)    // 환불 플래그
                t1 = moment()
                arroundtime = moment.duration(t1.diff(t0)).asSeconds()
                logger.info(`${client_request},${moment(t0).format('x')},${user_id},refundInfo,BC,${arroundtime}`)

                // const timestamp = moment().format('YYYY-MM-DD HH:mm:ss')
                // const transaction = {
                //     "from_id": 1,
                //     "to_id": user_id,
                //     "value": r_price,
                //     "timestamp": timestamp
                // }
                // await connection.query('INSERT INTO transactions SET ?', transaction)

                // 남은 참여자 없을 시 상태 코드 업데이트 (3-'ended')
                const [rows3] = await connection.query('SELECT user_id FROM participants WHERE participant_id=?', participant_id)
                if (!rows3.length) {
                    await connection.query('UPDATE auction_items SET status_code=3 WHERE item_id=?', item_id)
                }

                //await connection.commit()
                connection.release()
                return res.json({
                   success: true
                })
            } catch (err) {
                //await connection.rollback()
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