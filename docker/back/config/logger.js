const fs = require('fs');
const winston = require('winston');
const winstonDaily = require('winston-daily-rotate-file');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

/* Modify below to your log directory */
const logDir = './Log';

const { combine, timestamp, printf } = winston.format;
const LEVEL = Symbol.for('level');

// Define log format
const logFormat = printf(info => {
  return `${info.message}`;
});

function filterOnly(level) {
  return winston.format(info => {
    if (info[LEVEL] === level) {
      return info;
    }
  })();
}

/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
const logger = winston.createLogger({
  format: combine(
    logFormat,
  ),
  transports: [
    // info level
    new winstonDaily({
	stream: fs.createWriteStream(`${logDir}/server`),
      level: 'info',
      format: filterOnly('info'),
      maxFiles: 30,
      zippedArchive: true, 
    }),
  ]
});

// Only in development env.
logger.add(new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),  // `${info.level}: ${info.message} JSON.stringify({ ...rest })`
  )
}));

module.exports = logger;
