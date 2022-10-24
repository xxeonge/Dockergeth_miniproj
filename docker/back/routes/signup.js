var express = require('express')
var router = express.Router()
var logger = require('../config/logger')

/* Database */
const pool = require('./pool.js')


router.post('/', async (req, res, next) => {

    // const user = {
    //     'id' : req.body.user.id,
    //     'pw' : req.body.user.pw
    // };

    const user = {
        'id' : req.body.id,
        'pw' : req.body.pw
    };
    logger.info(user)
    try {
        const connection = await pool.getConnection(async conn=>conn)
        try {
			await connection.query('INSERT INTO users SET ?', user)
			connection.release()
			return res.json({
				success: true
			})
        } catch(err) {
            connection.release()
			return res.json({
				success: false,
				message: 'ID already exists'
			})
        }
    } catch(err) {
        logger.error(err)
        return res.json({
            success: false,
            message: 'connection error'
        })
    }
});

module.exports = router