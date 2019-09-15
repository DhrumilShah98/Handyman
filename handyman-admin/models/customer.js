var mongoose = require("mongoose");
var passportLocalMongooseCustomer = require("passport-local-mongoose");

var CustomerSchema = new mongoose.Schema({

    isCustomer: {
        type: Boolean,
        default: true,
        required: true
    },

    created: {
        type: Date,
        default: Date.now,
        required: true
    },

    fname: {
        type: String,
        required: true
    },

    lname: {
        type: String,
        required: true
    },

    username: {
        type: String,
        unique: true,
        required: true
    },

    email: {
        type: String,
        unique: true,
        required: true
    },
    
    password: {
        type: String
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date
});

CustomerSchema.plugin(passportLocalMongooseCustomer);
module.exports = mongoose.model("Customer", CustomerSchema);