var express = require('express');
var { Seek } = require('../modules/SeekScheme.js');
var { WSM } = require('./seek.js');
var { Game } = require("../modules/GameScheme.js");
var { User } = require('../modules/UserScheme.js');
var sanitizer = require('sanitizer');

var router = express.Router();

io.on('connection', function(socket){

	socket.on('setRoom', function(data){
		WSM.setRoom(socket, data);
		socket.join(data);
	});

	socket.on('piece moved', function(msg){
		if(typeof socket.request.session.passport !== 'undefined'){
			var namedSocket = WSM.findSocketByName(socket.request.session.passport.user.alias);
			var Room = WSM.getRoom(namedSocket);	
			io.to(Room).emit('piece moved', msg);
		}
	});

	socket.on('chat message', function(msg){
		var namedSocket = null;
		var Room = null;
		if(typeof socket.request.session.passport !== 'undefined'){
			namedSocket = WSM.findSocketByName(socket.request.session.passport.user.alias);
			Room = WSM.getRoom(namedSocket);	
			msg.msg = sanitizer.escape(msg.msg);
			msg.sender = sanitizer.escape(msg.sender);
			io.to(Room).emit("chat message", msg);
		}
	});

	socket.on("GAME_RESIGNED", function(user){
		var namedSocket = null;
		var Room = null;
		if(typeof socket.request.session.passport !== 'undefined'){
			namedSocket = WSM.findSocketByName(socket.request.session.passport.user.alias);
			Room = WSM.getRoom(namedSocket);	
			io.to(Room).emit("GAME_RESIGNED", user);
		}
	});

	socket.on("WHITE_WON", function(url){
		var namedSocket = null;
		var Room = null;
		if(typeof socket.request.session.passport !== 'undefined'){
			namedSocket = WSM.findSocketByName(socket.request.session.passport.user.alias);
			Room = WSM.getRoom(namedSocket);	
		}
		Game.findOne({gameId: url}, (err,game) => {
			if(err) next(err);

			if(game){
			    var players = [game.whitePlayer, game.blackPlayer];
				io.to(Room).emit("WHITE_WON", players);
			}
		});	
	});

	socket.on("BLACK_WON", function(url){
		var namedSocket = null;
		var Room = null;
		if(typeof socket.request.session.passport !== 'undefined'){
			namedSocket = WSM.findSocketByName(socket.request.session.passport.user.alias);
			Room = WSM.getRoom(namedSocket);	
		}
		Game.findOne({gameId: url}, (err,game) => {
			if(err) next(err);

			if(game){
			    var players = [game.blackPlayer, game.whitePlayer];
				io.to(Room).emit("WHITE_WON", players);
			}
		});	
	});
	socket.on("REDUCE_WHITE_TIME", function(url){
		var namedSocket = null;
		var Room = null;
		if(typeof socket.request.session.passport !== 'undefined'){
			namedSocket = WSM.findSocketByName(socket.request.session.passport.user.alias);
			Room = WSM.getRoom(namedSocket);	
		}
		Game.findOne({gameId: url }, (err,game) => {
			if(err) next(err);

			if(game){
				var _whiteTime = +game.whiteTime.toFixed(2);
				var _blackTime = +game.blackTime.toFixed(2);
				var i = 0;
				Game.changeWhiteTime(game.gameId, -.1, function(){	
					var array = new Float32Array(2);
					array[0] = _whiteTime;
					array[1] = _blackTime;			
					array = JSON.stringify(array);
					io.to(Room).emit("timeChanged", array);
				});
			}
		});
	});

	socket.on("REDUCE_BLACK_TIME", function(url){
		var namedSocket = null;
		var Room = null;
		if(typeof socket.request.session.passport !== 'undefined'){
			namedSocket = WSM.findSocketByName(socket.request.session.passport.user.alias);
			Room = WSM.getRoom(namedSocket);	
		}

		Game.findOne({gameId: url}, (err,game) => {
			if(err) next(err);

			if(game){
				var _whiteTime = +game.whiteTime.toFixed(2);
				var _blackTime = +game.blackTime.toFixed(2);

				Game.changeBlackTime(game.gameId, -.1, function(){	
					var array = new Float32Array(2);
					array[0] = _whiteTime;
					array[1] = _blackTime;			
					array = JSON.stringify(array);
					io.to(Room).emit("timeChanged", array);
				});
			}
		});
	});

	socket.on("stopTimer",function(){
		var namedSocket = null;
		var Room = null;
		if(typeof socket.request.session.passport !== 'undefined'){
			namedSocket = WSM.findSocketByName(socket.request.session.passport.user.alias);
			Room = WSM.getRoom(namedSocket);	
		}		
		socket.broadcast.to(Room).emit("stopTimer");
	})
})

router.get('/:gameId', (req,res,next) => {
	Game.findOne({gameId: req.params.gameId}, (err,game) => {
		if(err) next(err);

		if(game){
			if(game.winner !== 'DRAW'){
				res.render('chess',{winner: game.winner, loser: game.loser})
				return;
			}
			res.render('chess');
		}
		else next();
	})
});

router.post('/:gameId', (req,res,next) => {
	if(req.body.action === "GENERATE_MOVES"){
		var payload = JSON.parse(req.body.payload);
		Game.findOneAndUpdate({gameId: req.params.gameId}, { $push: { fen: payload["fen"], moves: payload["pgn"] } }, function(err,game){
			if(err) console.log(err);

			if(game){
				//game.fen = Fen;
				game.fen.push(req.body.payload);
				game.save(function(err, updated){
					if(err) next(err);
				})

				res.status(200).end();
			}
		});	

		res.status(200).end();
	}else if (req.body.action === 'LOAD_MOVES'){
		Game.findOne({gameId: req.params.gameId},(err,game) => {
			if(err) console.log(err);

			if(game.fen.length === 0){
				res.status(200).send(false);
			}			
			else{
				res.status(200).send({fen:game.fen[game.fen.length - 1], pgn: game.moves[game.moves.length - 1]});
			}
		});
	}else if (req.body.action === 'SORT_MOVES'){
		Game.findByGameId(req.params.gameId, function(err,game){
			console.log(req.params.gameId);
			if(err) console.log(err);

			if(game){
				if (req.body.winner !== 'DRAW'){
					var gameAmount = game.amount.substr(0, game.amount.length - 1);
					User.changeAmount(req.body.winner, +gameAmount + ( +gameAmount + (-gameAmount*2*0.10)), function(err,doc){
						if(err) console.log(err)

						if(doc){
							User.roundAmount(req.body.winner, doc.amount, function(err,_doc){
								if(err) console.log(err);
							})
						}
					});
					Game.updateWinner(req.params.gameId, req.body.winner, req.body.loser, function(err,doc){
						if(err) console.log(err);

						if(doc){
							var WR = doc.whiteRating;
							var BR = doc.blackRating;
							var K = 30;
							var whiteWon = null;
							var blackWon = null;
							if(req.body.winner === doc.whitePlayer){
								whiteWon = 1;
								blackWon = 0;
							}else{
								whiteWon = 0;
								blackWon = 1;
							}

							var P1 = ( 1.0 / ( 1.0 + Math.pow(10, ((WR-BR)/400))))
							var P2 = ( 1.0 / ( 1.0 + Math.pow(10, ((BR-WR)/400))))

							P1 = +P1.toFixed(2);
							P2 = +P2.toFixed(2);

							var WR1 = WR + K*(whiteWon - P1);
							var BR1 = BR + K*(blackWon - P2);

							WR1 = +WR1.toFixed(0);
							BR1 = +BR1.toFixed(0);

							User.changeRating(doc.whitePlayer, WR1, (err, doc) => {
								if(err) console.log(err);
							});
							User.changeRating(doc.blackPlayer, BR1, (err, doc) => {
								if(err) console.log(err);
							});
						}
					})
				}else if (req.body.winner === 'DRAW' && typeof req.body.players === 'object'){
					var players = req.body.players;
					players.forEach(x => {
						User.changeAmount(x, +gameAmount - (+gameAmount*0.1), function(err,doc){
							if(err) console.log(err);

							if(doc){
								User.roundAmount(x, doc.amount, function(err, _doc){
									if(err) console.log(err);
								})
								var WR = doc.whiteRating;
								var BR = doc.blackRating;		
								var K = 30;

								var P1 = ( 1.0 / ( 1.0 + Math.pow(10, ((WR-BR)/400))))
								var P2 = ( 1.0 / ( 1.0 + Math.pow(10, ((BR-WR)/400))))

								var WR1 = WR + K*(0.5 - P1);
								var BR1 = BR + K*(0.5 - P2);

								WR1 = +WR1.toFixed(0);
								BR1 = +BR1.toFixed(0);
								
								User.changeRating(doc.whitePlayer, WR1, (err, doc) => {
									if(err) console.log(err);
								});

								User.changeRating(doc.blackPlayer, BR1, (err, doc) => {
									if(err) console.log(err);
								});

							}
						})
					});
					Game.updateWinner(req.params.gameId, 'DRAW', 'DRAW', function(err,doc){
						if(err) console.log(err);

						
					})
				}
				game.moves = game.moves.slice(game.moves.length - 1);
				game.save(function(err,updated){
					if(err) next(err);

					res.status(200).end();
				})
			}
		});
	}else{
		Game.findOne({gameId: req.params.gameId}, (err,game) => {
			if(err) next(err);

			if(game){
				res.status(200).send({white: game.whitePlayer, black: game.blackPlayer});
			}else{
				res.status(404).end();
			}
		});
	}
	
});

router.post('/:gameId/result', (req,res) => {
	Game.findOne({gameId: req.params.gameId}, (err,game) => {
		if(err) next(err);

		if(game){
			if(typeof game.winner === 'string'){
				res.status(200).send(game.winner);
			}else{
				res.status(200).send(false);
			}
		}else{
			res.status(404).end();
		}
	})
});

router.post('/getTime/:gameId', (req,res) => {
	Game.findOne({gameId: req.params.gameId}, (err,game) => {
		if(err) next(err);

		if(game){
			var _whiteTime = +game.whiteTime.toFixed(2);
			var _blackTime = +game.blackTime.toFixed(2);

			var array = new Float32Array(2);
			array[0] = _whiteTime;
			array[1] = _blackTime;
			array = JSON.stringify(array);
			res.status(200).send(array);
		}else{
			res.status(404).end();
		}
	})
});

module.exports = router;