var mongoose = require("mongoose");

var CommentSchema = new mongoose.Schema({

    text: {
        type: String,
        required: true
    },

    created: {
        type: Date,
        default: Date.now
    },

    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer"
        },
        fname: String,
        lname: String,
        username: String
    }
});

module.exports = mongoose.model("Comment", CommentSchema);