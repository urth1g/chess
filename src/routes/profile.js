var express = require('express');
var { Seek } = require('../modules/SeekScheme.js');
var { User } = require('../modules/UserScheme.js');
var router = express.Router();
var { Game } = require("../modules/GameScheme.js");
var WSM = require('../modules/WebSocketManager.js');

router.get('/', function(req,res,next){
	if(req.user){
		Game.countDocuments({$or:[{ winner: req.user.alias}, {loser:req.user.alias}]}, (err, docs) => {
			Game.countDocuments({winner: req.user.alias}, (err,_docs) => {
				res.render('profile', {num: (100/docs)*_docs || 0 });
			});
		});
	}else{
		res.render('index');
	}
});

module.exports = router;