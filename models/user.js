let mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
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