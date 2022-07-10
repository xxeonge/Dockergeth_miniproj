var createError = require('http-errors');
var express = require('express');
var app = express();
// var server = require("http").createServer(app);
// var io = require("socket.io")(server);
//server.listen(8080);
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//var mysql = require('mysql');

var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');  // 로그인 & 회원가입
var signupRouter = require('./routes/signup');
var accountRouter = require('./routes/account');
var productsRouter = require('./routes/products');  // 제품 등록
var interestsRouter = require('./routes/interests');  // 관심경매 제품 등록
//var auctionRouter = require('./routes/auction');  // 경매 동작
//var chainRouter = require('./routes/chain');
var dbRouter = require('./routes/db'); // DB ver
var bcRouter = require('./routes/bc'); // BC ver
var dbbcRouter = require('./routes/dbbc'); // DB+BC ver
var validateRouter = require('./routes/validate'); // validate function

app.use(require('connect-history-api-fallback')());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/api/products', productsRouter)
app.use('/api/interests', interestsRouter)
app.use('/api/user', userRouter)
//app.use('/api/auction', auctionRouter)
app.use('/api/signup', signupRouter)
app.use('/api/account', accountRouter)
//app.use('/api/chain', chainRouter)
app.use('/api/db', dbRouter)
app.use('/api/bc', bcRouter)
app.use('/api/dbbc', dbbcRouter)
app.use('/api/validate', validateRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
