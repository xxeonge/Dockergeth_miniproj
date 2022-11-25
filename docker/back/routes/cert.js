var express = require('express');
var router = express.Router();
var Web3 = require('web3')
var BigNumber = require('bignumber.js')
var logger = require('../config/logger')
var fs = require('fs');
var path = require("path");
var net = require('net');

let compileCA = JSON.parse(fs.readFileSync(path.join(__dirname, '../build/contracts/Certificate_sol_Certificate.abi')).toString())

/* DB */
const moment = require('moment')
const pool = require('./pool.js');
const { Console } = require('console');

/* time */
require('moment-timezone')
moment.tz.setDefault("Asia/Seoul")

/* GETH NODE IP */
var nodeIPAddress = require('./nodeIPAddress.js')
console.log(nodeIPAddress[0])

let requestNumber = 0
const arr = [100,50,25,5,10];

// 인증서 등록/DB에 인증서 저장
router.post('/issue', async (req, res, next) => {
    const clientRequest = moment().format('x');
    const date = moment().format('YYYY-MM-DD HH:mm:ss');
    const name = req.body.name
    const birth = req.body.birth
    const caAddr = req.body.caAddr
    const certificateOwner = req.body.certificateOwner

    const profile = {
        'user_name' : req.body.name,
        'user_birth' : req.body.birth,
        'user_pubkey' :  req.body.certificateOwner
    }
    
    try {
        const connection = await pool.getConnection(async conn => conn)
        try {
            await connection.beginTransaction()

            let t0 = moment()
            await connection.query('INSERT INTO user_info SET issuer_id=?, ?', [1, profile])
            let t1 = moment()
            logger.info(`${clientRequest},${moment(t0).format('x')},${certificateOwner},insertUserInfo,DB,${moment.duration(t1.diff(t0)).asMilliseconds()}`)
            const web3 = new Web3(new Web3.providers.HttpProvider(nodeIPAddress[requestNumber % (nodeIPAddress.length)], { reconnect: { auto: true } }))
            const ca = new web3.eth.Contract(compileCA, caAddr)

            requestNumber += 1
            t0 = moment()
            await ca.methods.issue(name, birth).send({from: certificateOwner, gas: web3.eth.gasPrice})
                .then(async function (receipt) {
                    console.log(receipt)
                    t1 = moment()
                    logger.info(`${clientRequest},${moment(t0).format('x')},${certificateOwner},issueCertificate,BC,${moment.duration(t1.diff(t0)).asMilliseconds()}`)
                    
                    t0 = moment()
                    let res_value = await ca.method.getCertificate()
                    console.log(res_value)
                    t1 = moment()
                    logger.info(`${clientRequest},${moment(t0).format('x')},${certificateOwner},getCertificate,BC,${moment.duration(t1.diff(t0)).asMilliseconds()}`)
                    let toString = res_value.toString();
                    let strArray = toString.split(",");
                    let cert_addr = strArray[0]
                    let notBefore = new Date(strArray[3]*1000);
                    let notAfter = new Date(strArray[4]*1000);
                    let cert_id = strArray[5]
                    t0 = moment()
                    await connection.query('INSERT INTO user_cert_info SET cert_addr=?, cert_effective_date=?, cert_expiration_date=?, cert_id=?', [cert_addr,notBefore,notAfter,cert_id])
                    t1 = moment()
                    logger.info(`${clientRequest},${moment(t0).format('x')},${certificateOwner},insertCertInfo,DB,${moment.duration(t1.diff(t0)).asMilliseconds()}`)
                    
                    await connection.commit()
                    connection.release()
                    return res.json({ // 요거 반환값 나중에 좀 생각하기
                        success: true, 
                        message: 'certificate successfully success'
                    })
                }
                );
        } catch(err){
            await connection.rollback()
            connection.release()
            throw err
        }
    } catch(err){
        logger.error(err)
        res.json({
            success: false,
            message: 'connection error'
        })
    }

});