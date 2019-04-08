let mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
	userName: {
		type: String,
		required: true,
		default: "test"
	},
	password: {
		type: String,
		required: true,
		default: "password"
	},
	firstName: {
		type: String,
		required: true
	},
	lastName: {
		type: String,
		required: true
	},
	bio: {
		type: String,
		required: true,
		max: 1500
	},
	phoneNumber: {
		type: String,
		required: true
	},
	activePreference: {
		type: Number,
		min: 0,
		max: 5
	},
	preferredCallDuration: {
		type: Number,
		min: 10
	},

	topicsOfInterest: {
		type: String,
		required: true,
		enum: ['Academics', 'Athletics', 'Hobbies', 'Sports', 'Random']
	},
	isWaiting: {
		type: Boolean,
		required: true,
		default: false
	},
	dateAdded: {
		type: Date,
		required: false
	},
	dateModified: {
		type: Date,
		required: false
	}
});

module.exports = mongoose.model('User', userSchema);