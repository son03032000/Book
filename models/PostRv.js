var moment = require("moment");
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var PostRvSchema = new Schema({
  text: { type: String, required: true },
  author: {
    id: {
      type: Schema.ObjectId,
      ref: "user",
    },
    username: String,
  },
  book: { type: Schema.ObjectId, ref: "Book", required: true }, //reference to the associated book
  status: {
    type: String,
    required: true,
    enum: ["Hay", "Rất Hay", "Khá ", "Tệ"],
    default: "Rất Hay",
  },
  due_back: { type: Date, default: Date.now },
});

// Virtual for comment's URL
PostRvSchema.virtual("url").get(function () {
  return "/user/PostRV/" + this._id;
});

//Virtual for date formatting using moment
PostRvSchema.virtual("due_back_formatted").get(function () {
  return moment(this.due_back).format("MMMM Do, YYYY");
});

//Export model
module.exports = mongoose.model("PostRV", PostRvSchema);
