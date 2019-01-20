var express = require('express');
var { Seek } = require('../modules/SeekScheme.js');
var { User } = require('../modules/UserScheme.js');
var router = express.Router();
var { Game } = require("../modules/GameScheme.js");
var WSM = require('../modules/WebSocketManager.js');

function toFixed(value, precision) {
    var power = Math.pow(10, precision || 0);
    return Number(Math.round(value * power) / power);
}

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
 		if(typeof previousSocket !== 'undefined'){
 			previousSocket.join(game.id, () => console.log('joined'));
 		}else{
 			return;
 		}
 		if(typeof socket !== 'undefined'){
 			socket.join(game.id, () => console.log('joined'));
 		}else{
 			return;
 		}
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
 			}else{
  				var rand = Math.floor(Math.random()*2);
 				white = players[rand];
 				black = players.filter(x => x !== white)[0];				
 			}
 			if(white && black){
	 			Seek.returnAmount(game.id, (amounts) =>{
	 				var newGame = new Game({
		 				gameId: game.id,
		 				whitePlayer: white,
		 				blackPlayer: black,
		 				whiteTime: 60,
		 				blackTime: 60,
		 				whiteRating: WSM.findSocketRatingByName(white),
		 				blackRating: WSM.findSocketRatingByName(black),
		 				amount: amounts,
		 				moves: [],
		 				fen:[]
	 				});

	 				var amount = +amounts.substr(0, amounts.length - 1);
	 				var _amount = +socket.request.session.passport.user.amount.toFixed(2);
	 				var amountWithFee = amount + (amount * 0.1);

	 				if(_amount >= amount){
	 					User.changeAmount(socket.request.session.passport.user.alias, -amount, function(err,doc){
	 						if(err) console.log('greska');

	 						if(doc){
	 							User.roundAmount(socket.request.session.passport.user.alias, doc.amount, function(err,_doc){
	 								if(err) console.log(err);
	 							})
		     				}
	 					});
	 					User.changeAmount(previousSocket.request.session.passport.user.alias, -amount, function(err,doc){
	 						if(err) console.log('greska');

	 						if(doc){
	 							User.roundAmount(previousSocket.request.session.passport.user.alias, doc.amount, function(err,_doc){
	 								if(err) console.log(err);
	 							});
		     				} 						
	 					})

			 			newGame.save(function(err){
			 				if(err) console.log(err);
			 			});
			 			io.to(game.id).emit("joinGame", game);
	 				}else{
	 					io.to(socket.id).emit("error");
	 				}

	 			})
 			}

 		});
 	});

 	socket.on('disconnect', function(){
 		if(typeof socket.request.session.passport !== 'undefined'){
 	 		Seek.checkIfUserExists(socket.request.session.passport.user.alias, true, (err,game) => {
	 			if(err) console.log(err);

	 			if(game){
		 			Seek.removeByUserAlias(socket.request.session.passport.user.alias);
		 		}
	 		});			
	 		io.emit("disconnected", socket.request.session.passport.user.alias); 
	 		WSM.socketDisconnected(socket);
	 	}
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
		if(req.body.action === 'REQUEST_AMOUNT'){
			console.log('amount requsted');

			User.returnAmount(req.user.alias, function (err, amount){
				if(err)
					console.log(err);
				else
					res.status(200).json(amount.amount);
			});
			return;
		}
		var game = new Seek({
			userAlias: req.user.alias,
			amount: req.body.money,
			time: req.body.time,
			rating: req.user.rating,
			color: req.body.color
		});

		var money = req.body.money.substr(0, req.body.money.length - 1);
		if((req.user.amount >= money) && (money >= 1)){
			Seek.checkIfUserExists(req.user.alias, false, () => {

				game.save(function(err){
					if(err) console.log(err);
					res.status(200).send(game);
				});
			});			
		}else{
			res.status(200).send({error : true});
		}
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
