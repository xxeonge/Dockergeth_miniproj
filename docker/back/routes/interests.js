var express = require('express')
var router = express.Router()
var logger = require('../config/logger')

/* Database */
const pool = require('./pool.js')

router.post('/register', async (req, res, next) => {
    const interest = {
        'user_id' : req.body.user_id,
        'item_id': req.body.item_id
    }

    try {
        const connection = await pool.getConnection(async conn=>conn)
        try {
			const [rows] = await connection.query('SELECT COUNT(*) as cnt FROM interests WHERE user_id=? and item_id=?', [interest.user_id, interest.item_id])
		    if (rows[0].cnt != 0) {
				connection.release()
                return res.json({
                    success: false
				})
			}
			await connection.query('INSERT INTO interests SET ?', interest)
			connection.relese()
			return res.json({
				success: true,
				message: '등록 성공'
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

router.post('/delete', async (req, res, next) => {

    const user_id = req.body.user_id
    const item_id = req.body.item_id

    try {
        const connection = await pool.getConnection(async conn=>conn)
        try {
			await connection.query('DELETE FROM interests WHERE user_id=? AND item_id=?', [user_id, item_id])
			connection.relese()
			return res.json({
				success: true
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