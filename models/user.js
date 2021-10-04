var mongoose = require("mongoose");
passportLocalMongoose = require("passport-local-mongoose");
var Schema = mongoose.Schema;
const UserSchema = mongoose.Schema(
  {
    firstName:{type: String, trim: true},
    lastName:{type: String, trim: true},
    email:{type: String, trim: true},
    username: String,
    password: String,
    joined: { type: Date, default: Date.now() },
    gender: String,
    address: String,
    image: {type: String, default:""},
    isAdmin: { type: Boolean, default: false },
  },
  { collection: "user" }
);

UserSchema.plugin(passportLocalMongoose);
const UserModel = mongoose.model("user", UserSchema);

module.exports = UserModel;

