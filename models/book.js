var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var BookSchema = new Schema({
  title: { type: String, required: true },
  author: { type: Schema.ObjectId, ref: "Author", required: true },
  summary: { type: String, required: true },
  ImageUrl: { type: String, required: true },
  genre: [{ type: Schema.ObjectId, ref: "Genre" }],
  comments: [{
    type: Schema.ObjectId,
    ref: "comment"
  }],
  postRv: [{
    type: Schema.ObjectId,
    ref: "PostRV"
  }]

});

// Virtual for book's URL
BookSchema.virtual("url").get(function () {
  return "/catalog/book/" + this._id;
});

//Export model
module.exports = mongoose.model("Book", BookSchema);
