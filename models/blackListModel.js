var mongoose = require("mongoose");

const BlackListSchema = mongoose.Schema(
  {
    token: String,
  },
  { collection: "blackList" }
);

const BlackListModel = mongoose.model("blackList", BlackListSchema);

module.exports = BlackListModel;
