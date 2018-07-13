var express = require('express');
var { Seek } = require('../modules/SeekScheme.js');
var router = express.Router();

router.get('/', (req,res,next) => {
	res.render('index')
});

router.get('/user', (req,res,next) => {
	if(req.user){
		res.status(200).send(req.user)
	}else{
		res.status(200).send({})
	}
});

module.exports = router;