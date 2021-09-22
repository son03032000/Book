const UserModel = require("../models/userModel");
const BlackListModel = require("../models/blackListModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { render } = require("pug");
const fs = require("fs");

exports.user_list = async (req, res) => {
  try {
    const user_list = await UserModel.find();
    res.json(user_list);
  } catch (err) {
    res.json(err);
  }
};

exports.postLogin = async (req, res) => {
  try {
    const checkUser = await UserModel.findOne({
      username: req.body.username,
    });
    if (checkUser) {
      const checkPassword = await bcrypt.compare(
        req.body.password,
        checkUser.password
      );
      if (checkPassword) {
        const token = jwt.sign({ id: checkUser._id }, "mk", {
          expiresIn: "30d",
        });
        res.json({ status: 200, id: token, mess: "ok" });
      } else {
        res.json({ status: 400, mess: "sai password" });
      }
    } else {
      res.json({ status: 400, mess: "sai username và password" });
    }
  } catch (error) {
    res.json({ error, mess: "server error", status: 500 });
  }
};

// exports.postCheckLogin = async (req, res) => {
//   try {
//     if (req.cookies.user) {
//       const token = req.cookies.user;
//       const checkToken = await BlackListModel.findOne({ token });
//       if (checkToken) {
//         res.json({ mess: "cookie bị hạn chế", status: 400 });
//       } else {
//         const id = jwt.verify(token, "mk").id;
//         const checkUser = await UserModel.findOne({ _id: id });
//         if (checkUser) {
//           res.json({ mess: "user da dang nhap", status: 200 });
//         } else {
//           res.json({ mess: "cookie khong hop le", status: 400 });
//         }
//       }
//     } else {
//       res.json({ mess: "chua dang nhap", status: 400 });
//     }
//   } catch (error) {
//     res.json({ error, mess: "server error", status: 500 });
//   }
// };

exports.postLogout = async (req, res) => {
  try {
    await BlackListModel.create({ token: req.cookies.user });
    res.json({ status: 200, mess: "ok" });
  } catch (error) {
    res.json({ error, mess: "server error", status: 500 });
  }
};

exports.getId = async (req, res) => {
  try {
    const data = await UserModel.findOne({ _id: req.params.id });
    res.json(data);
  } catch (err) {
    res.json(err);
  }
};

exports.postCheckUser = async (req, res) => {
  try {
    const checkUser = await UserModel.findOne({ username: req.body.username });
    if (checkUser) {
      res.json({ status: 400, mess: "username đã sử dung" });
    } else {
      req.body.password = await bcrypt.hash(req.body.password, 10);
      await UserModel.create({
        username: req.body.username,
        password: req.body.password,
      });
      res.json({ status: 200, mess: "tao tk thanh cong" });
    }
  } catch (error) {
    res.json({ status: 500, error, mess: "loi server" });
  }
};
exports.UpdateId = async (req, res) => {
  try {
    var password = await bcrypt.hash(req.body.newPass, 10);
    const data = await UserModel.updateOne(
      { _id: req.params.id },
      { password: password }
    );
    if (data.n == 0) {
      res.json("nhap sai password cu");
    } else if (data.nModified == 0) {
      res.json("password cũ và mới giống nhau");
    } else {
      res.json("đổi password thành công");
    }
  } catch (err) {
    console.log(err);
    res.json(err);
  }
};
exports.DeleteID = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const result = await UserModel.deleteOne({ _id: userId });
    if (result.deletedCount !== 0) {
      res.json({ status: 200, mess: "xoa thanh cong" });
    } else {
      res.json({ status: 400, mess: "khong tim thay user" });
    }
  } catch (error) {
    res.json({ status: 500, error, mess: "loi server" });
  }
};
