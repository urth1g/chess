var express = require('express');
var { Seek } = require('../modules/SeekScheme.js');
var { User } = require('../modules/UserScheme.js');
var router = express.Router();
var { Game } = require("../modules/GameScheme.js");
var WSM = require('../modules/WebSocketManager.js');


io.on('connection', async function(socket){

	if(typeof socket.request.session.passport !== 'undefined'){
		socket.name = socket.request.session.passport.user.alias;
		socket.rating = socket.request.session.passport.user.rating;
		WSM.addSocket(socket);
	}	

  	socket.on('newGame', function(game){
    	io.emit('newGame', game);
 	});

  	socket.on('setRoomId', function(game){
  		WSM.setRoom(game.gameId);
  	});
  	
 	socket.on('joinGame', function(game) {
 		var previousSocket = WSM.findSocketByName(game.userAlias);
 	    previousSocket.join(game.id, () => console.log('joined'));
 		socket.join(game.id, () => console.log('joined'));
 		WSM.setRoom(previousSocket, game.id);
 		WSM.setRoom(socket, game.id);
 		var players = [previousSocket.name,socket.name];
 		Seek.returnColor(previousSocket.name,(color) => {
 			var white;
 			var black;
 			if(color === 'random'){
 				var rand = Math.floor(Math.random()*2);
 				white = players[rand];
 				black = players.filter(x => x !== white)[0];
 			}else if(color === 'white'){
 				white = players[0];
 				black = players[1];
 			}else if(color === 'black'){
 				white = players[1];
 				black = players[0];
 			}

 			Seek.returnAmount(game.id, (amounts) =>{
 				var newGame = new Game({
	 				gameId: game.id,
	 				whitePlayer: white,
	 				blackPlayer: black,
	 				whiteRating: WSM.findSocketRatingByName(white),
	 				blackRating: WSM.findSocketRatingByName(black),
	 				amount: amounts,
	 				moves: []
 				});

	 			newGame.save(function(err){
	 				if(err) console.log(err);
	 			})
 			})

 		io.to(game.id).emit("joinGame", game);
 		});
 	});

 	socket.on('disconnect', function(){
 		Seek.removeByUserAlias(socket.request.session.passport.user.alias);
 		io.emit("disconnected", socket.request.session.passport.user.alias); 
 		WSM.socketDisconnected(socket);
 	});
});

router.get('/', (req,res,next) => {
	if(req.user){
		res.render('seek');
	}else{
		res.redirect('/login')
	}
});

router.post('/', (req,res) => {
	if(typeof req.user !== 'undefined'){
		var game = new Seek({
			userAlias: req.user.alias,
			amount: req.body.money,
			time: req.body.time,
			rating: req.user.rating,
			color: req.body.color
		});

		Seek.checkIfUserExists(req.user.alias, () => {
			game.save(function(err){
				if(err) console.log(err);
				res.status(200).send(game);
			});
		});
	}else{
		res.status(400).end();
	}
});

router.get('/:fetch', (req,res,next) => {
	if(req.params.fetch === 'fetch'){
		Seek.find(function(err,games){
			if(err) console.log(err);
			res.status(200).send({games});
		})
	}else{
		next();
	}
});

module.exports.seekView = router;
module.exports.WSM = WSM;
