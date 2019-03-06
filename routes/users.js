var express = require('express');
var router = express.Router();
const ngrok = require('ngrok');

var currentCallingNumber = "+"

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
	    phoneNumber: '+12345678901',
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


router.get('/twiML', function(req, res, next) {
	const twiml = new twilioClient.twiml.VoiceResponse();
    
    const dial = twiml.dial({
      callerId: '+18317041029',
      record: 'record-from-ringing'
    });

    //srource for DIAL https://www.twilio.com/docs/voice/twiml/dial#record

    dial.number(currentCallingNumber);

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
});


router.get('/startCall', async function(req, res, next) {

	try {
		var ngrokUrl = await ngrok.connect(8000);
		ngrokUrl = ngrokUrl + "/users/twiML";
		console.log("ngrok url: " + ngrokUrl);
	} catch (err) {
		console.log(err);
	}

	// I need to write the TwiML to some location that Twilio can see...
	console.log("Target Number: " + req.query.targetNumber);
	console.log("Calling Number: " + req.query.callingNumber);
	currentCallingNumber = req.query.callingNumber;

	twilioClient.calls
	      .create({
			 url: ngrokUrl,
	         to: req.query.targetNumber,
	         from: '+12244123420' //Twilio phone number
	       },
			  (err, call) => {
			    process.stdout.write(call.sid);
			  }
	       )
	      .then(call => console.log(call.sid))
	      .done();

  	await ngrok.disconnect();
  	res.status(200).send("called successfully.");

});

module.exports = router;
