var express = require('express');
var router = express.Router();
var logger = require('../config/logger')

/* Database */
const pool = require('./pool')

const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

/* 활성 경매 리스트 */
router.post('/', async (req, res, next) => {
    var user_id = req.body.user_id
    if (user_id == null) {
        user_id = -1
    }

    try {
        const connection = await pool.getConnection(async conn=>conn)
        try {
			const [result] = await connection.query('select distinct a.*, (select MAX(value) from bids where a.item_id=item_id) max_bid, if(exists(select * from participants where item_id=a.item_id and user_id=?), 1, 0) flag from auction_items as a left join participants as p on a.item_id=p.item_id where status_code=1 order by start_date desc', 
			user_id)
			connection.release()
			return res.send(result)
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

/* 활성 경매 리스트 - 카테고리 */
/*router.post('/:id', async (req, res, next) => {
    var user_id = req.body.user_id
    
    if (user_id == null) {
        user_id = -1
    }

    try {
        const connection = await pool.getConnection(async conn=>conn)
        try {
			const [result] = await connection.query('select distinct a.*, (select MAX(value) from bids where a.item_id=item_id) max_bid, if(exists(select * from participants where item_id=a.item_id and user_id=?), 1, 0) flag from auction_items as a left join participants as p on a.item_id=p.item_id where category_code=? order by start_date desc', 
			[user_id, req.params.id])
			connection.release()
			return res.send(result)
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
})*/

// 종료 전의 모든 경매 목록 (낙찰 & 보증금 환불 중 경매 포함)
router.post('/not-end', async (req,res,next) => {
    var user_id = req.body.user_id
    if (user_id == null) {
        user_id = -1
    }
    try {
        const connection = await pool.getConnection(async conn=>conn)
        try {
         const [result] = await connection.query('select distinct a.*, (select MAX(value) from bids where a.item_id=item_id) max_bid, if(exists(select * from participants where item_id=a.item_id and user_id=?), 1, 0) flag from auction_items as a left join participants as p on a.item_id=p.item_id where status_code < 4 order by start_date desc', 
            user_id)  
            connection.release()
          return res.send(result)
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

module.exports = router;
