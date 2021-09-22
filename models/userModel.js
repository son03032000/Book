var mongoose = require('mongoose');

var Schema = mongoose.Schema;
const UserSchema = mongoose.Schema(
  {
    username: String ,
    password: String,
    role: String,
  },
  { collection: "user" }
);
// UserSchema
// .virtual('url')
// .get(function() {
//   return '/user/member' + this._id;
// });


const UserModel = mongoose.model("user", UserSchema);



module.exports = UserModel;
//module.exports = mongoose.model('user', UserSchema);





