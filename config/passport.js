var LocalStrategy   = require('passport-local').Strategy;
var User            = require('../models/user');
var Schema          = require("../db/schema");
// (1) TwitterStrategy: middleware required to implement Twitter login via Passport.
// (2) Env: so we can access our Twitter API information.
var TwitterStrategy = require('passport-twitter').Strategy;
var env             = require('../env');

//Creating a new User based on the information passed to us from Twitter.
module.exports = function(passport) {
passport.use('local-signup', new LocalStrategy({
  usernameField : 'email',
  passwordField : 'password',
  passReqToCallback : true
}, function(req, email, password, callback) {
  // Find a user with this e-mail
  User.findOne({ 'local.email' :  email }, function(err, user) {
    if (err) return callback(err);

    // If there already is a user with this email
    if (user) {
      return callback(null, false, req.flash('signupMessage', 'Email already in Use'));
    } else {
      // There is no email registered with this emai
      // Create a new user
      var newUser            = new User();
      newUser.local.email    = email;
      newUser.local.password = newUser.encrypt(password);

      newUser.save(function(err) {
        if (err) throw err;
        return callback(null, newUser);
      });
    }
  });
}));
//session methods
passport.serializeUser(function(user, callback) {
  callback(null, user.id);
});

passport.deserializeUser(function(id, callback) {
  User.findById(id, function(err, user) {
    callback(err, user);
  });
});
//custom strategy for login
passport.use('local-login', new LocalStrategy({
  usernameField : 'email',
  passwordField : 'password',
  passReqToCallback : true
}, function(req, email, password, callback) {

  // Search for a user with this email
  User.findOne({ 'local.email' :  email }, function(err, user) {
    if (err) {
      return callback(err);
    }
    // If no user is found. Also, add flash msgs later
    if (!user) {
      return callback(null, false, req.flash('loginMessage', 'User Not Found'));
    }
    // Wrong password. Also, add flash msgs later
    if (!user.validPassword(password)) {
      return callback(null, false, req.flash('loginMessage', 'Password Incorrect'));
    }
    return callback(null, user);
  });

}));

//TWITTER STRATEGY
passport.use("twitter", new TwitterStrategy({
  consumerKey: env.twitter.consumerKey,
  consumerSecret: env.twitter.consumerSecret,
  callbackUrl: env.twitter.callbackUrl
}, function(token, secret, profile, done){
  process.nextTick(function(){
    User.findOne({"twitter.id": profile.id}, function(err, user){

      //if user already exists, just return that user.
      if(user){
        return done(null, user);
      } else {
        //otherwise, create a brand new user
        var newUser = new User();

        //saving information passed to us from twitter
        newUser.twitter.id = profile.id;
        newUser.twitter.token = token;
        newUser.twitter.username = profile.username;
        newUser.twitter.displayName = profile.displayName;

        newUser.save(function(err){
          if(err) throw err;
          return done(null, newUser);
        });
      }
    });
  });
}

));
};
