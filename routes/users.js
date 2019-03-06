var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/app-db', {useNewUrlParser: true});
var User = require('../models/user') // note that the .js ending is optional


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/addBob', function(req, res, next) {
	var bob = new User({
	    firstName: 'Bob',
	    lastName: 'Smith',
	    bio: 'An adventurous lad.',
	    activePreference: 3,
	    preferredCallDuration: 20,
	    topicsOfInterest: 'Academics',
	    dateAdded: new Date()
	  });

	bob.save(function (err) {
		if (err) return handleError(err);
	});

  	res.send('Added another Bob to the database!');
});


router.post('/addUser', function(req, res, next) {
	console.log('trying to add user');

	if (!('firstName' in req.body)) {
		res.status(400).send('Missing body items');
		return;
	} 

	var user = new User({
	    firstName: req.body.firstName,
	    lastName: req.body.lastName,
	    bio: req.body.bio,
	    phoneNumber: req.body.phoneNumber,
	    activePreference: req.body.activePreference,
	    preferredCallDuration: req.body.preferredCallDuration,
	    topicsOfInterest: req.body.topicsOfInterest,
	    dateAdded: new Date()
	  });

	console.log(user);

	user.save(function (err) {
		if (err) {
			console.log(err);
			return handleError(err);
		}
	});
	
	res.send('Thanks for posting!');
	// var user = new User({
	// });
});

module.exports = router;
