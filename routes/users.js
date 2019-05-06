var express = require('express');
var nodeSchedule = require('node-schedule');
var router = express.Router();
var devMode = process.env.DEV_MODE;
// var waitingUsers = require("../data.js"); // I think this is the right syntax for this
waitingUsers = [];

var currentCallingNumber = "12345678901"

// These are Ankur's
const accountSid = 'ACdc94f86bec1e788b280632d85ea8ace5'; //Find these in your Twilio profile, https://www.twilio.com/console
const authToken = process.env.TWILIO_KEY;
const twilioClient = require('twilio')(accountSid, authToken);
const VoiceResponse = require('twilio').twiml.VoiceResponse;

var User = require('../models/user') // note that the .js ending is optional

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
console.log(process.env.DEV_MODE);


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.status(200).send("User API Base");
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

	req.body.password = bcrypt.hashSync(req.body.password, 10);

	var user = new User({
	    userName: req.body.userName,
	    password: req.body.password,
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
	
	// TODO: will need to change this so I can retrieve the entire user object with the ID as well
	// res.status(200).send("Successfully added a user.");
	
	res.status(200).send(user);

});


router.post('/login', async function (req, res, next) {
	console.log("Logging in with userName: " + req.body.userName);
	var user = await User.findOne({userName: req.body.userName}).exec();
	if (!user) {
		return res.status(404).send("Error: user not found.");
	}

	if (!bcrypt.compareSync(req.body.password, user.password)) {
		return res.status(400).send("The password is invalid.");
	}

	return res.status(200).send(user);
});


router.use('/twiML', async function(req, res, next) {
	var twiml = new VoiceResponse();
    
    const dial = twiml.dial({
      callerId: '+12244123420',
      record: 'record-from-ringing'
    });

    //srource for DIAL https://www.twilio.com/docs/voice/twiml/dial#record

    dial.number(currentCallingNumber);

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    var twimlString = twiml.toString();
    console.log(twimlString);
    res.end(twimlString);

});


router.post('/startCall', async function(req, res, next) {
	try {
		startCall(req.body.targetNumber, req.body.callingNumber);	
		res.status(200).send("called successfully.");
	} catch(err) {
		res.status(400).send("Error -- failed to call.");
	}
	
});

// NOTE: I think this will work... 
// NOTE: Think this is the right structure...
async function startCall(targetNumber, callingNumber) {
	// I need to write the TwiML to some location that Twilio can see...
	console.log("Target Number: " + targetNumber);
	console.log("Calling Number: " + callingNumber);
	currentCallingNumber = callingNumber;

	twilioClient.calls
	      .create({
			 url: "https://commuter-499.herokuapp.com/users/twiml",
	         to: targetNumber,
	         from: '+12244123420' //Twilio phone number
	       },
			  (err, call) => {
			  	if (err) {
			  		throw(err);
			  	}
			    process.stdout.write(call.sid);
			  }
	       )
	      .then(call => console.log(call.sid))
	      .done();
}


router.get('/getUser', async function(req, res, next) {

	// I need to write the TwiML to some location that Twilio can see...
	
	console.log("User ID: " + req.query.id);

	User.findById(req.query.id, function (err, user) {
		if (err || user == null) {
			res.status(404).send('Error: user not found.');
			return;
		}

		// send user object back to frontend
		res.status(200).send(user);
	})


  	// res.status(200).send("called successfully.");

});


// toggle the wait status of a user. switches between true/false -- opposite of existing value
router.get('/toggleWaitStatus', function(req, res, next) {
	
	User.findById(req.query.id, function (err, user) {
		if (err || user == null) {
			res.status(404).send('Error: user not found.');
			return;
		}
		
		user.isWaiting = !user.isWaiting;

		user.save(function (err) {
			if(err) {
				console.error('Error toggling wait status of user.')
			}
		});
		
		// if the user is now, add them to the queue
		if (user.isWaiting) {
			waitingUsers.push(user.phoneNumber);
		}
		if (!user.isWaiting) {
			waitingUsers.remove(user.phoneNumber);
		}
		res.status(200).send("Waiting status of " + user.firstName + " " + user.lastName + " modified to: " + user.isWaiting);

	});
	

});


// toggle the wait status of a user. switches between true/false -- opposite of existing value
router.get('/addTestUserToWaitingList', function(req, res, next) {
	console.log("Adding test user to waitlist...");
	console.log(waitingUsers);
	waitingUsers.push('' + Math.floor(Math.random() * 1000000000));
	res.status(200).send(waitingUsers);
});


// this should run every minute...
/*
	Ok, so whenever a user switches their waiting status in the database, I want to add them to the queue of waiting users...
		... which is an array I'm storing in memory
		... and users should probably default to "off" when they login.
		... which means that they should only be added to the queue when they hit the endpoint..
		... so I probably shouldn't maintain this as a field of the users
		... instead, I should just keep it in memory
		... and I should probably keep phone numbers as the user ID tokens...

		... so when someone hits the endpoint, just add their number to the queue
		.. and then every minute, if tehre are two people in the queue, just start a call between them...
*/

var j = nodeSchedule.scheduleJob('* * * * *', function() {
  console.log(Date.now() + ": Executing call CRON job...")
  console.log(waitingUsers);


	for (let i = waitingUsers.length - 1; i > 0; i--) {
	    const j = Math.floor(Math.random() * (i + 1));
	    [waitingUsers[i], waitingUsers[j]] = [waitingUsers[j], waitingUsers[i]];
	}

  // execute while there are at least two peeps in teh waitingUsers queue...
  while (waitingUsers.length >= 2) {
  	var phoneNumberOne = waitingUsers.shift();
  	var phoneNumberTwo = waitingUsers.shift();

  	try {
  		if (devMode == "DEVELOP") {
  			console.log("[DEV ] Calling " + phoneNumberOne + " <> " + phoneNumberTwo);
  		}
  		if (devMode == "PRODUCTION") {
  			console.log("[PROD] Calling " + phoneNumberOne + " <> " + phoneNumberTwo);
  			startCall(phoneNumberOne, phoneNumberTwo);	
  		}
  		
  	} catch {
  		// error message and re-add them to db
  		console.log("Failed to call successfully. Adding numbers back to queue...")
  		waitingUsers.push(phoneNumberOne);
  		waitingUsers.push(phoneNumberTwo);
  	}

  }

 
});




module.exports = router;
