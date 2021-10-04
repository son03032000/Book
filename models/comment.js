const mongoose = require("mongoose")

var Schema = mongoose.Schema;

const CmtSchema = new Schema({
    text: String,
    author: {
        id:{
            type: Schema.ObjectId,
            ref: "user",
        },
        username: String,
    },
    book: {
        id:{
            type: Schema.ObjectId,
            ref: "Book",
        },
        title: String,
    },
    date: {type: Date, default: Date.now()}
});
module.exports = mongoose.model("comment",CmtSchema)