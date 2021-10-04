var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var activitySchema = new Schema({
    info: {
        id: {
            type: Schema.ObjectId,
            ref:"Book"
        },
        title: String,
    },
    category: String,
    user_id: {
        id: {type:Schema.ObjectId,
        ref:"User",
    },
    username: String,
    },
    fine: {
        amount: Number,
        date: Date,
    },
    entryTime: {
        type: Date,
        default: Date.now(),
    }
})

module.exports = mongoose.model("Activity", activitySchema)