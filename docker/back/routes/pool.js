const mysql = require('mysql2/promise');

const config = require('../config/db-config(dev).json'); 
//const config = require('../config/db-config(prd).json');

const pool = mysql.createPool(config);

module.exports = pool;