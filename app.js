const express = require('express');
const path = require('path');

const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const index = require('./routes/index');
const callbackRouter_sb=require('./routes/callbackRouter_seungbeom.js');
const requestRouter_sb=require('./routes/requestRouter_seungbeom.js');
const welcomeRouter_sb=require('./routes/welcomeRouter_seungbeom');
const functions_schedules=require('./routes/functions_schedules');

const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', welcomeRouter_sb);
app.use('/request', requestRouter_sb);
app.use('/callback', callbackRouter_sb);
app.use('/', index);
app.use('/',functions_schedules);


// catch 404 and forward to error handlere
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ err });
});

app.listen(process.env.PORT || 3000, () => console.log('Example app listening on port 3000!'));

module.exports = app;