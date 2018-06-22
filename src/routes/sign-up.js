var express = require('express');
var { check, validationResult } = require('express-validator/check');
var User = require('../modules/UserScheme.js');
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
	    check('username').isLength({min:1})
	    .withMessage('Username is required'),
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
			passwordConfirm: req.body.passwordConfirm
		};
  		User.create(userData, (err,user) => {
			if(err) console.log(err);
			//req.session.userId = user._id;
			res.render('sign-up',{success : true});
		});
	}
});

module.exports = router;
