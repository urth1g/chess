var express = require('express');
var { check, validationResult } = require('express-validator/check');
var { transporter, mailOptions } = require('../modules/transporter.js');
var { User } = require('../modules/UserScheme.js');
var router = express.Router();


router.get('/',(req, res) => {
	res.render('sign-up');
});

router.post('/', [
		check('email').isEmail()
		.withMessage('Please write an e-mail address'),
		check('email').custom(async function(value){
	    	var email = await User.find({email:value})
	    	return email.length === 0;
	    })
	    .withMessage('Email already exists'),
	    check('username').custom(async function(value) {
	    	var user = await User.find({username:value})
	    	return user.length === 0;
	    })
	    .withMessage('Username already exists'),
	    check('username').isLength({min:1, max:20})
	    .withMessage('Username must contain between 1 and 20 characters.'),
	    check('username').custom((value) => {
	    	var regExp = /^[a-zA-Z0-9-_]+$/;
	    	return 	regExp.test(value);
	    }).withMessage('Username can only contain letters, numbers and dashes/underscores'),
	    check('password').isLength({min:8})
	    .withMessage('Password has to be atleast 8 characters long'),
	    check('passwordConfirm').custom((value, {req}) => value === req.body.password)
	    .withMessage('Passwords do not match')
    ],(req,res) => {

	//req.checkBody('username', 'Username is required').notEmpty();
    //req.checkBody('password', 'Password has to be atleast 8 characters long').isLength({min:8});
    //req.checkBody('email', 'Invalid email address').isEmail();
    //req.checkBody('passwordConfirm','Passwords do not match').equals(req.body.password);

    var errors = validationResult(req);

	if (!errors.isEmpty()) {
	    //req.session.errors = errors.mapped();
	    //req.session.success = false;
	    res.render('sign-up',{errors: errors.mapped(), success: false})
	}else{
		const saltRounds = 10;

		var userData = {
			username: req.body.username,
			alias: req.body.username,
			password: req.body.password,
			email:req.body.email,
			passwordConfirm: req.body.passwordConfirm,
		};

		mailOptions.to = userData.email;
		console.log(mailOptions.to);
  		User.create(userData, (err,user) => {
			if(err) console.log(err);
			//req.session.userId = user._id;
			res.render('sign-up',{success : true});
			transporter.sendMail(mailOptions, function(error, info){
				if (error) {
			    	console.log(error);
				} else {
					console.log('Email sent: ' + info.response);
				}
			});
		});
	}
});

router.get('/confirm/:emailString', (req,res,next) => {
	if(req.params.emailString){
		User.findOne({emailString: req.params.emailString}, function(err, user){
			if(err) next(err)
			if(!user){
				req.flash('error_msg','The activation link is no longer valid');
				return res.redirect('/login');
			}
			if(user){
				console.log(user);
				User.update(user,{canLogin:true,$unset:{emailString:"0"}}, (err, numAf, rawResponse) => {
					if(err) next(err);
					req.flash('success_msg','Thank you for activating your account! You can login now and start winning! Good Luck');
					res.redirect('/login')
					//console.log(numAf)
				})
			}
		});
	}
});

module.exports = router;
