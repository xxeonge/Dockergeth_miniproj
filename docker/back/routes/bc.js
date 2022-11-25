// var express = require('express');
// var router = express.Router();
// var Web3 = require('web3')
// var BigNumber = require('bignumber.js')
// var logger = require('../config/logger')
// var fs = require('fs');
// var path = require("path");
// var net = require('net');


// let complieBox = JSON.parse(fs.readFileSync((path.join(__dirname, '../build/contracts/Blockchain_sol_BlockchainBox.abi')).toString()))
// let compileAuction = JSON.parse(fs.readFileSync(path.join(__dirname, '../build/contracts/Blockchain_sol_BlockchainAuction.abi')).toString())
// let firstBid = false

// /* Database */
// const moment = require('moment')
// const pool = require('./pool.js');
// const { Console } = require('console');

// /* current time */
// require('moment-timezone')
// moment.tz.setDefault("Asia/Seoul")

// /* GETH NODE IP */
// var nodeIPAddress = require('./nodeIPAddress.js')
// console.log(nodeIPAddress[0])

// let requestNumber = 0
// const arr = [100,50,25,5,10];


// // 경매 등록 geth ok
// router.post('/register', async (req, res, next) => {
//     const clientRequest = moment().format('x')
//     const date = moment().format('YYYY-MM-DD HH:mm:ss');
//     const userID = req.body.user_id
//     const closeDate = req.body.product.date + " " + req.body.product.time
//     const auctionOwner = req.body.auctionOwner
//     const boxAddress = req.body.boxAddress

//     const product = {
//         'category_code': req.body.product.category,
//         'status_code': 1,
//         'name': req.body.product.name,
//         'start_date': date,
//         'close_date': closeDate,
//         'reserve_price': req.body.product.price,
//         'img_url': req.body.product.img_url,
//         'description': req.body.product.description,
//         'contract': req.body.product.contract
//     };

//     try {
//         const connection = await pool.getConnection(async conn => conn)
//         try {
//             await connection.beginTransaction()

//             let t0 = moment()
//             await connection.query('INSERT INTO auction_items SET user_id=?, ?', [userID, product])
//             let t1 = moment()
//             logger.info(`${clientRequest},${moment(t0).format('x')},${auctionOwner},insertAuction,DB,${moment.duration(t1.diff(t0)).asMilliseconds()}`)
//             const web3 = new Web3(new Web3.providers.HttpProvider(nodeIPAddress[requestNumber % (nodeIPAddress.length)], { reconnect: { auto: true } }))            
//             const box = new web3.eth.Contract(complieBox, boxAddress)

//             requestNumber += 1
//             t0 = moment()
//             await box.methods.createAuction(1, moment(closeDate).unix()).send({ from: auctionOwner, gas: web3.eth.gasPrice })
//                 .then(async function (receipt) {
//                     console.log(receipt)
//                     t1 = moment()
//                     logger.info(`${clientRequest},${moment(t0).format('x')},${auctionOwner},generateAuction,BC,${moment.duration(t1.diff(t0)).asMilliseconds()}`)
//                     const contract = receipt['events']['AuctionCreated']['returnValues']['auctionContract']  //auction 주소
//                     product.contract = contract

//                     t0 = moment()
//                     await connection.query('UPDATE auction_items SET contract=? WHERE item_id=?', [contract, 1])
//                     t1 = moment()
//                     logger.info(`${clientRequest},${moment(t0).format('x')},${auctionOwner},updateAuction,DB,${moment.duration(t1.diff(t0)).asMilliseconds()}`)

//                     await connection.query('create event if not exists event_? on schedule at ? on completion not preserve enable do update auction_items set status_code=2 where item_id=?', [1, closeDate, 1])
//                     await connection.commit()
//                     connection.release()
//                     return res.json({
//                         success: true,  // 성공
//                         item_id: 1,   // 경매 번호
//                         product: product,   // 경매 정보 (딕셔너리)
//                         owner_id: userID,  // 오너 고유번호
//                         owner_account: auctionOwner  // 오너 계약주소
//                     })
//                 }
//                 );


//         } catch (err) {
//             await connection.rollback()
//             connection.release()
//             throw err
//         }
//     } catch (err) {
//         logger.error(err)
//         res.json({
//             success: false,
//             message: 'connection error'
//         })
//     }
// });

// // 경매 참여 geth ok
// router.post('/participate', async (req, res, next) => {
//     const clientRequest = moment().format('x')
//     const itemID = req.body.participate.item_id

//     const price = req.body.participate.price
//     const AuctionParticipate = req.body.participate.user_ganache

//     const web3 = new Web3(new Web3.providers.HttpProvider(nodeIPAddress[requestNumber % (nodeIPAddress.length)], { reconnect: { auto: true } }))
//     requestNumber += 1;

//     const gweiPrice = web3.utils.toWei(price.toString(), 'Gwei')

//     try {
//         const connection = await pool.getConnection(async conn => conn)
//         try {
//             const [item_list] = await connection.query('SELECT * FROM auction_items WHERE item_id=?', itemID) // 경매 상태코드 검사
//             const item = item_list[0]

//             if (item.status_code != 1) {
//                 connection.release()
//                 return res.json({ success: false, message: 'rigged request' })
//             }
//             const auction = new web3.eth.Contract(compileAuction, item.contract)

//             let t0 = moment()

//             await auction.methods.receiveDeposit().send({
//                 from: AuctionParticipate,
//                 value: gweiPrice,
//                 gas: web3.eth.gasPrice
//             }).then(() => {
//                 let t1 = moment()
//                 logger.info(`${clientRequest},${moment(t0).format('x')},${AuctionParticipate},participatePay,BC,${moment.duration(t1.diff(t0)).asMilliseconds()}`)
//                 connection.release()
//                 return res.json({ success: true, message: 'auction participate success' })
//             })

//         } catch (err) {
//             connection.release()
//             throw err
//         }
//     } catch (err) {
//         logger.error(err)
//         return res.json({
//             success: false,
//             message: 'connection error'
//         })
//     }
// })

// // 입찰 geth_ok
// router.post('/bid', async (req, res, next) => {
//     var clientRequest = moment().format('x')
//     const itemID = req.body.item_id;
//     const AuctionParticipate = req.body.user_ganache;

//     let web3 = new Web3(new Web3.providers.HttpProvider(nodeIPAddress[requestNumber % (nodeIPAddress.length)], { reconnect: { auto: true } }))
//     requestNumber += 1;

//     web3.eth.handleRevert = true

//     try {
//         const connection = await pool.getConnection(async conn => conn)
//         try {
//             const [item_list] = await connection.query('SELECT * FROM auction_items WHERE item_id=?', itemID) // 경매 상태코드 검사
//             const item = item_list[0]

//             if (item.status_code != 1) {
//                 connection.release()
//                 return res.json({
//                     success: false,
//                     message: 'rigged request'
//                 })
//             }
//             let highestBids = 0
//             const auction = new web3.eth.Contract(compileAuction, item.contract)
//             try {
//                 let options = {
//                     fromBlock: "pending",
//                     toBlock: "latest"
//                 };
//                 let t0 = moment()
//                 auction.getPastEvents('LogBid', options)
//                     .then(async function (receipt) {
//                         let t1 = moment()
//                         logger.info(`${clientRequest},${moment(t0).format('x')},${AuctionParticipate},logBid,BC,${moment.duration(t1.diff(t0)).asMilliseconds()}`)
//                         if (receipt.length == 0) {
//                             highestBids = await web3.utils.toWei("1", 'Gwei')
//                         }
//                         else if (receipt.length > 0) {
//                             highestBids = Math.max(parseInt(receipt[0].returnValues.bid), parseInt(receipt[receipt.length - 1].returnValues.bid))
//                             highestBids = await web3.utils.fromWei(highestBids.toString(), 'Gwei')
//                             highestBids = parseInt(highestBids) + 1
//                             highestBids = await web3.utils.toWei(highestBids.toString(), 'Gwei')
//                         }
//                         t0 = moment()
//                         await auction.methods.bid(highestBids).send({
//                             from: AuctionParticipate,
//                             gas: web3.eth.gasPrice
//                         }).then(async function (receipt) {
//                             t1 = moment()
//                             logger.info(`${clientRequest},${moment(t0).format('x')},${AuctionParticipate},bid,BC,${moment.duration(t1.diff(t0)).asMilliseconds()}`)
//                             connection.release()
//                             return res.json({
//                                 success: true,
//                                 message: 'event bid'
//                             })
//                         }).catch(err => {
//                             t1 = moment()
//                             connection.release()
//                             if(err.reason == "It's smaller than the highestBids." || err.message.includes( "It's smaller than the highestBids." )){
//                                 logger.info(`${clientRequest},${moment(t0).format('x')},${AuctionParticipate},bidSmaller,BC,${moment.duration(t1.diff(t0)).asMilliseconds()}`)
//                             }else{
//                                 logger.info(`${clientRequest},${moment(t0).format('x')},${AuctionParticipate},bidError,BC,${moment.duration(t1.diff(t0)).asMilliseconds()}`)
//                             }
//                             return res.json({
//                                 success: false,
//                                 message: err.reason
//                             })
//                         })
//                     })
//             }
//             catch (err) {
//                 connection.release()
//                 return res.json({
//                     success: false,
//                     message: 'connection error'
//                 })
//             }
//         } catch (err) {
//             connection.release()
//             return res.json({
//                 success: false,
//                 message: 'connection error'
//             })
//         }
//     } catch (err) {
//         return res.json({
//             success: false,
//             message: 'connection error'
//         })
//     }
// })

// // 낙찰자 여부 true false ok
// router.post('/winner', async (req, res, next) => {
//     const itemID = req.body.item_id;
//     const clientRequest = moment().format('x')
//     const AuctionParticipate = req.body.user_ganache;

//     let web3 = new Web3(new Web3.providers.HttpProvider(nodeIPAddress[requestNumber % (nodeIPAddress.length)], { reconnect: { auto: true } }))
//     requestNumber += 1;

//     try {
//         const connection = await pool.getConnection(async conn => conn)
//         try {
//             const [item_list] = await connection.query('SELECT * FROM auction_items WHERE item_id=?', itemID) // 경매 상태코드 검사
//             const item = item_list[0]
            
//             const auction = new web3.eth.Contract(compileAuction, item.contract)
//             try {
//                 let options = {
//                     fromBlock: "pending",
//                     toBlock: "latest"
//                 };
//                 let t0 = moment()
//                 auction.getPastEvents('LogBid', options)
//                     .then(async function (receipt) {
//                         let t1 =  moment()
//                         let highestBidder = ""
//                         logger.info(`${clientRequest},${moment(t0).format('x')},${AuctionParticipate},logBidW,BC,${moment.duration(t1.diff(t0)).asMilliseconds()}`)
//                         let idx = -1
//                         if (receipt.length > 1){
//                             idx = parseInt(receipt[0].returnValues.bid)> parseInt(receipt[receipt.length - 1].returnValues.bid) ? 0 : receipt.length - 1
//                             highestBidder = receipt[idx].returnValues.bidder
//                         }else{
//                             console.log("here")
//                             t0 = moment()
//                             highestBidder = await auction.methods.highestBidder().call()
//                             t1 =  moment()
//                             logger.info(`${clientRequest},${moment(t0).format('x')},${AuctionParticipate},getHighestBidder,BC,${moment.duration(t1.diff(t0)).asMilliseconds()}`)
//                         }
//                         connection.release()
//                         console.log()
//                         return res.json({
//                             success: true,
//                             highestBidder: highestBidder
//                         })
//                     })
//             }
//             catch (err) {
//                 connection.release()
//                 console.log(err)
//                 return res.json({
//                     success: false,
//                     message: 'connection error'
//                 })
//             }
//         } catch (err) {
//             connection.release()
//             return res.json({
//                 success: false,
//                 message: 'connection error'
//             })
//         }
//     } catch (err) {
//         return res.json({
//             success: false,
//             message: 'connection error'
//         })
//     }
// })

// /* 낙찰 */
// router.post('/successful', async (req, res, next) => {
//     const clientRequest = moment().format('x')
//     const itemID = req.body.item_id;
//     const AuctionParticipate = req.body.user_ganache;

//     let web3 = new Web3(new Web3.providers.HttpProvider(nodeIPAddress[requestNumber % (nodeIPAddress.length)], { reconnect: { auto: true } }))
//     requestNumber += 1;
    
//     try {
//         const connection = await pool.getConnection(async conn => conn)
//         try {
//             const [item_list] = await connection.query('SELECT * FROM auction_items WHERE item_id=?', itemID)
//             const item = item_list[0]

//             if (item.status_code != 2) {
//                 connection.release()
//                 return res.json({
//                     success: false,
//                     message: 'rigged request - wrong status code'
//                 })
//             }

//             const auction = new web3.eth.Contract(compileAuction, item.contract)

//             // 낙찰자 잔액 부족 처리
//             let t0 = moment()
//             const winnerBalarnce = await web3.eth.getBalance(AuctionParticipate)
//             let t1 = moment()
//             logger.info(`${clientRequest},${moment(t0).format('x')},${AuctionParticipate},getBalance,BC,${moment.duration(t1.diff(t0)).asMilliseconds()}`)

//             t0 = moment()
//             let highestBids = await auction.methods.highestBids().call()
//             t1 = moment()
//             logger.info(`${clientRequest},${moment(t0).format('x')},${AuctionParticipate},checkHighestBid,BC,${moment.duration(t1.diff(t0)).asMilliseconds()}`)

//             if (BigNumber(winnerBalarnce).lt(BigNumber(highestBids))) {
//                 connection.release()
//                 res.json({
//                     success: false,
//                     message: 'insufficient balance'
//                 })
//             }
//             /* 거래 시작 */
//             try {
//                 try {
//                     console.log("herer")
//                     t0 = moment()
//                     const successfulBid = await auction.methods.successfulBid().send({
//                         from: AuctionParticipate,
//                         value: highestBids,
//                         gas: web3.eth.gasPrice
//                     }).then(async function (receipt) {
//                         t1 = moment()
//                         logger.info(`${clientRequest},${moment(t0).format('x')},${AuctionParticipate},bidSuccessPay,BC,${moment.duration(t1.diff(t0)).asMilliseconds()}`)
//                         connection.release()
//                         return res.json({
//                             success: true
//                         })
//                     }).catch(err => {
//                         connection.release()
//                         console.log(err.reason)
//                     })
//                 } catch {
//                     t1 = moment()
//                     connection.release()
//                     logger.info(`${clientRequest},${moment(t0).format('x')},${AuctionParticipate},bidSuccessFail,BC,${moment.duration(t1.diff(t0)).asMilliseconds()}`)
//                     return res.json({
//                         success: false,
//                         message: err.message
//                     })
//                 }

//             } catch (err) {
//                 connection.release()
//                 throw err
//             }
//         } catch (err) {
//             connection.release()
//             throw err
//         }
//     } catch (err) {
//         logger.error(err)
//         return res.json({
//             success: false,
//             message: 'connection error'
//         })
//     }
// })

// /* 낙찰 후 보증금 환불 */
// router.post('/withdraw', async (req, res, next) => {
//     var clientRequest = moment().format('x')
//     const itemID = req.body.item_id
//     const AuctionParticipate = req.body.user_ganache
//     try {
//         const connection = await pool.getConnection(async conn => conn)
//         try {
//             const [item_list] = await connection.query('SELECT * FROM auction_items WHERE item_id=?', itemID) // 경매 상태코드 검사
//             const item = item_list[0]
//             // 조작된 요청 (경매 상태코드 2 - 'ended' 상태가 아닐 때)
//             if ((item.status_code != 2)) {
//                 connection.release()
//                 return res.json({
//                     success: false,
//                     message: 'rigged request - wrong item status'
//                 })
//             }
//             /* 거래 시작 */
//             try {
//                 let web3 = new Web3(new Web3.providers.HttpProvider(nodeIPAddress[requestNumber % (nodeIPAddress.length)], { reconnect: { auto: true } }))
//                 requestNumber += 1;
//                 const auction = new web3.eth.Contract(compileAuction, item.contract)
//                 var t0 = moment()
                
//                 const refundDeposit = await auction.methods.refundDeposit().send({
//                     from: AuctionParticipate,
//                     gas: web3.eth.gasPrice
//                 }).then(async function (receipt) {
//                     let t1 = moment()
//                     logger.info(`${clientRequest},${moment(t0).format('x')},${AuctionParticipate},depositRefund,BC,${moment.duration(t1.diff(t0)).asMilliseconds()}`)
//                     connection.release()
//                     return res.json({
//                         success: true
//                     })
//                 })

//             } catch (err) {
//                 connection.release()
//                 throw err
//             }
//         } catch (err) {
//             connection.release()
//             throw err
//         }
//     } catch (err) {
//         logger.error(err)
//         return res.json({
//             success: false,
//             message: 'connection error',
//         })
//     }
// })

// module.exports = router
