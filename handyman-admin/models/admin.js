var mongoose = require("mongoose");
var passportLocalMongooseCustomer = require("passport-local-mongoose");

var AdminSchema = new mongoose.Schema({

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

AdminSchema.plugin(passportLocalMongooseCustomer);
module.exports = mongoose.model("Admin", AdminSchema);