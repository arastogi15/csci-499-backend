#! /usr/bin/env node

console.log('This script populates some users your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0-mbdj7.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
console.log("Db url: " + userArgs);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var User = require('./models/user')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


var users = []

function userCreate(first_name, last_name, bio, phone_number, active_preference, min_call_time, areas_of_interest, is_waiting, cb) {
  userdetail = {
    firstName:first_name , 
    lastName: last_name,
    bio:bio,
    phoneNumber: phone_number,
    activePreference: active_preference, 
    preferredCallDuration: min_call_time,
    topicsOfInterest: areas_of_interest,
    isWaiting: is_waiting
    }

  
  var user = new User(userdetail);
       
  user.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New User: ' + user);
    users.push(user)
    cb(null, user)
  }  );
}



function createUsers(cb) {
    async.series([
        function(callback) {
          // date created and date modified not mentioned here
          userCreate('Test', 'User', 'An enterprising young lad.', '1234567890', 3, 15, 'Academics', false, callback); 
        },
        ],
        cb);
}


async.series([
    createUsers
],

// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('Users: ' + users);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});



