var express = require('express');
var { Seek } = require('../modules/SeekScheme.js');
var { WSM } = require('./seek.js');
var { Game } = require("../modules/GameScheme.js");
var { User } = require('../modules/UserScheme.js');
var router = express.Router();

io.on('connection', function(socket){

	socket.on('setRoom', function(data){
		WSM.setRoom(socket, data);
		socket.join(data);
	});

	socket.on('piece moved', function(msg){
		var namedSocket = WSM.findSocketByName(socket.request.session.passport.user.alias);
		var Room = WSM.getRoom(namedSocket);	
		io.to(Room).emit('piece moved', msg);
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

module.exports = router;