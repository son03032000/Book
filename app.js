var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');


var UserRouter = require("./routes/user");
var index = require('./routes/index');
var catalog = require('./routes/catalog'); //imports routes for catalog area of site
var compression = require('compression');


var app = express();

//Compress all routes
app.use(compression());


//Set up mongoose connection
const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/reviewSach', {

});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use("/public", express.static(path.join(__dirname, "./public")));

app.use('/', index);
app.use("/user", UserRouter);
app.use('/catalog', catalog);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
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
  res.render('error');
});
app.listen(3000, ()=>{
  console.log(`server started on port`)
});


module.exports = app;
