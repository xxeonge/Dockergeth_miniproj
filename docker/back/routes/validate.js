/* Input validation API */
var express = require('express');
var router = express.Router();
var logger = require('../config/logger')

/* Database */
const pool = require('./pool.js')

/* current time */
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

// 경매 상태 코드 반환
router.post('/status', async (req,res,next) => {

    const item_id = req.body.item_id

    try {
        const connection = await pool.getConnection(async conn=>conn)
        try {
            const [item] = await connection.query('SELECT status_code FROM auction_items WHERE item_id=?', item_id) // 경매 상태코드 검사

            connection.release()
            return res.json({
                success: true,
                status_code: item[0].status_code
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

// 환불 여부
router.post('/withdraw', async (req,res,next) => {

    const item_id = req.body.item_id
    const user_id = req.body.user_id

    try {
        const connection = await pool.getConnection(async conn=>conn)
        try {
            const [item] = await connection.query('SELECT refund_flag FROM participants WHERE item_id=? and user_id=?', [item_id, user_id]) // 경매 상태코드 검사

            let flag = false;
            if (item[0].refund_flag != 0) {
                flag = true;
            }
            connection.release()
            return res.json({
                success: true,
                refund: flag
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

// 경매 참여 여부
router.post('/participate', async (req, res, next) => {

    const item_id = req.body.item_id
    const user_id = req.body.user_id

    try {
        const connection = await pool.getConnection(async conn=>conn)
        try {
            const [rows] = await connection.query('SELECT user_id FROM participants where item_id=? and user_id=?', [item_id, user_id])
            let verified = true
            
            if (rows.length == 0) {
                verified = false
            }

            connection.release()
            return res.json({
               verified: verified
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

module.exports = router