var express = require('express')
var router = express.Router()
var logger = require('../config/logger')

/* Database */
const pool = require('./pool.js')


/* 사용자 관심경매 목록 반환 */
router.post('/interests', async (req, res, next) => {

    const user_id = req.body.user_id

    try {
        const connection = await pool.getConnection(async conn=>conn)
        try {
			const [result] = await connection.query('select distinct a.*, (select value from highests where a.item_id=item_id) max_bid, if(exists(select * from participants where item_id=a.item_id and user_id=?), 1, 0) flag from auction_items as a left outer join interests as i on i.item_id=a.item_id where i.user_id=? order by start_date desc', 
			[user_id, user_id])
			connection.release()
			return res.send(result)
        } catch(err) {
            connection.release()
            throw err
        }
    } catch(err) {
        logger.error(err)
        res.json({
            success: false,
            message: 'connection error'
        })
        throw err
    }
})

/* 입찰한 경매 목록 반환 */
router.post('/bids', async (req, res, next) => {

    const user_id = req.body.user_id

    try {
        const connection = await pool.getConnection(async conn=>conn)
        try {
			const [result] = await connection.query('select distinct a.*, (select value from highests where a.item_id=item_id) max_bid, if(exists(select * from participants where item_id=a.item_id and user_id=?), 1, 0) flag  from auction_items as a left outer join bids as b on b.item_id=a.item_id where b.user_id=? and a.status_code=1 order by start_date desc', 
            [user_id, user_id])
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

/* 입찰한 경매 중 사용자에게 낙찰 대기 경매 목록 */
router.post('/bids/winning', async (req, res, next) => {

    const user_id = req.body.user_id

    try {
        const connection = await pool.getConnection(async conn=>conn)
        try {
			const [result] = await connection.query('select distinct a.*, (select value from highests where a.item_id=item_id) max_bid from auction_items as a left outer join participants as p on p.item_id=a.item_id where p.user_id=? and status_code=2 and p.refund_flag=0 and if((SELECT user_id FROM highests WHERE item_id=a.item_id)=? AND (SELECT winning_flag FROM highests WHERE item_id=a.item_id)=0, 1, 0)=1 order by start_date desc;',
			[user_id, user_id])
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

/* 입찰한 경매 중 보증금 환불 받을 경매 목록 */
router.post('/bids/withdrawing', async (req, res, next) => {

    const user_id = req.body.user_id

    try {
        const connection = await pool.getConnection(async conn=>conn)
        try {
			const [result] = await connection.query('select distinct a.*, (select value from highests where a.item_id=item_id) max_bid from auction_items as a left outer join participants as p on p.item_id=a.item_id where p.user_id=? and (status_code=2 or status_code=4) and if((SELECT user_id FROM highests WHERE item_id=a.item_id)=? AND (SELECT winning_flag FROM highests WHERE item_id=a.item_id)=0, 1, 0)=0 and p.refund_flag=0 order by start_date desc',
			[user_id, user_id])
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

/* 입찰한 경매 중 종료된 경매 목록 */
router.post('/bids/ended', async (req, res, next) => {

    const user_id = req.body.user_id

    try {
        const connection = await pool.getConnection(async conn=>conn)
        try {
			const [result] = await connection.query('select distinct a.*, (select value from highests where a.item_id=item_id) max_bid from auction_items as a left outer join participants as p on p.item_id=a.item_id where p.user_id=? and a.status_code=3 order by start_date desc',
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

/* 사용자가 연 경매 반환 */
router.post('/owned', async (req, res, next) => {

    const user_id = req.body.user_id

    try {
        const connection = await pool.getConnection(async conn=>conn)
        try {
			const [result] = await connection.query('select distinct a.*, (select value from highests where a.item_id=item_id) max_bid from auction_items as a where user_id=? and status_code=1 order by start_date desc',
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

/* 사용자가 연 경매 중 낙찰자 송금 대기 경매 */
router.post('/owned/winning', async (req, res, next) => {

    const user_id = req.body.user_id

    try {
        const connection = await pool.getConnection(async conn=>conn)
        try {
			const [result] = await connection.query('select distinct a.*, (select value from highests where a.item_id=item_id) max_bid from auction_items as a where user_id=? and status_code=2 order by start_date desc',
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

/* 사용자가 연 경매 중 보증금 환불 중인 경매 */
router.post('/owned/withdrawing', async (req, res, next) => {

    const user_id = req.body.user_id

    try {
        const connection = await pool.getConnection(async conn=>conn)
        try {
			const [result] = await connection.query('select distinct a.*, (select value from highests where a.item_id=item_id) max_bid from auction_items as a where user_id=? and (status_code=2 or status_code=4) order by start_date desc',
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

/* 사용자가 연 경매 중 종료된 경매 */
router.post('/owned/ended', async (req, res, next) => {

    const user_id = req.body.user_id

    try {
        const connection = await pool.getConnection(async conn=>conn)
        try {
			const [result] = await connection.query('select distinct a.*, (select value from highests where a.item_id=item_id) max_bid from auction_items as a left outer join sellers as s on s.item_id=a.item_id and s.user_id=? where a.status_code=3 order by start_date desc',
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


/* 사용자 낙찰품 목록 반환 */
router.post('/successfuls', async (req, res, next) => {

    const user_id = req.body.user_id

    try {
        const connection = await pool.getConnection(async conn=>conn)
        try {
			const [result] = await connection.query('select * from auction_items as a left outer join (select * from highests where user_id=? and winning_flag=1) as b on a.item_id = b.item_id where b.user_id=?', 
			[user_id, user_id])
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

module.exports = router