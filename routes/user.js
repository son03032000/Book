const router = require("express").Router();
const UserModel = require("../models/userModel");
const BlackListModel = require("../models/blackListModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { checkLogin, checkAdmin } = require("../middleWare/check");

var user_controller = require('../controllers/user')

router.get("/", user_controller.user_list);

router.post("/login", user_controller.postLogin);

router.post("/checkLogin", user_controller.postCheckLogin);

router.post("/logout",  user_controller.postLogout)

router.get("/:id", user_controller.getId);

router.post("/", user_controller.postCheckUser)

router.put("/:id", user_controller.UpdateId);

router.delete("/:id",checkLogin,checkAdmin, user_controller.DeleteID);



module.exports = router;