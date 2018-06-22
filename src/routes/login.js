var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../modules/UserScheme.js');

router.get('/', (req,res,next) => {
	res.render('login')
});

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  User.findById(user._id, function(err,user) {
  	done(null, user);
  })
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
      	console.log('incorrect u');
        return done(null, false, { message: 'Incorrect username.' });
      }else{
	      user.validPassword(password, function(err,res){
	      	if(err) console.log(err);

	      	if(!res){
	      		console.log('Incorrect p');
	      		return done(null, false, { message: 'Incorrect password.' });
	      	}else{
	      		console.log('its a hit')
	      		return done(null, user);
	      	}
	      })
  		}
    });
  }
));

router.post('/', 
	passport.authenticate('local', {succesRedirect:'/', failureRedirect:'/login', session: true}), 
	function(req,res, next){
		res.redirect('/');
	});
module.exports = router;