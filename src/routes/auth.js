var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var { User } = require('../modules/UserScheme.js');

router.get('/login',
	(req,res,next) => {
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

passport.use(new LocalStrategy({passReqToCallback: true},
  function(req, username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
      	//console.log('incorrect u');
        return done(null, false, req.flash('error_msg','Invalid username or password'));
      }else{
			user.validPassword(password, function(err,res){
	      	if(err) console.log(err);
	      	if(!res){
	      		//console.log('Incorrect p');
	      		return done(null, false, req.flash('error_msg','Invalid username or password'));
	      	}else{
	      		if(!user.canLogin){
       				//console.log('Verify email')
       				return done(null, false, req.flash('error_msg','Please verify your e-mail address'));
       			}
	      		return done(null, user);
	      	}
	      	});  	
  		}
    });
  }
));

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

router.post('/login', function(req,res,next){
		if(req.body.username === '' || req.body.password === ''){
			req.flash('error_msg','Invalid username or password');
			return res.redirect('/login');
		}
		next();
	},
	passport.authenticate('local', {failureRedirect:'/login', session: true, failureFlash: true}), 
	function(req,res, next){
		res.redirect('/');
	});


module.exports = router;