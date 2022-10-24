var express = require('express')
var router = express.Router()
var logger = require('../config/logger')

/* Database */
const pool = require('./pool.js')

router.post('/login', async (req, res, next) => {
    // console.log(req.body.user.id)
    const user = {
        'id' : req.body.user.id,
        'pw' : req.body.user.pw
    };
    try {
        const connection = await pool.getConnection(async conn => conn)
        try {
            const [rows] = await connection.query('SELECT user_id FROM users WHERE id=? and pw=?', [user.id, user.pw])
            
            if (!rows.length) {
                // console.log("no exists")
                connection.release();
                res.json({
                    success: false,
                    message: "no exists"
                })
            } else {
                // console.log("exists")
                connection.release();
                return res.json({
                    success: true,
                    user_no: rows[0].user_id
                })
            } 
        } catch (err) {
            connection.release()
            throw err
        }
    } catch (err) {
        logger.error(err)
        return res.json({
            success: false,
            message: 'connection error'
        })
    }
});


module.exports = router