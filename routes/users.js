var express = require('express');
var router = express.Router();

// These are Ankur's
const accountSid = 'ACdc94f86bec1e788b280632d85ea8ace5'; //Find these in your Twilio profile, https://www.twilio.com/console
const authToken = 'f504ba0bf8cbee3d8891307393512f44';
const twilioClient = require('twilio')(accountSid, authToken);

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


router.get('/startCall', function(req, res, next) {

	// I need to write the TwiML to some location that Twilio can see...
	console.log(req.query.targetNumber);
	twilioClient.calls
	      .create({
			 url: 'http://demo.twilio.com/docs/voice.xml',
	         to: req.query.targetNumber,
	         from: '+12244123420' //Twilio phone number
	       },
			  (err, call) => {
			    process.stdout.write(call.sid);
			  }
	       )
	      .then(call => console.log(call.sid))
	      .done();

  	res.status(200).send("called successfully.");

});

module.exports = router;
