var express = require('express');
var router = express.Router();
const path = require("path");
const UserModel = require("../models/userModel");

/* GET home page. */

router.get('/', function(req, res, next) {
  res.redirect('/catalog');
});

router.get("/member", function (req, res) {
  res.render('home');
});



router.get("/login", (req, res) => {
  res.render('login');;
});
module.exports = router;