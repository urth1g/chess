var express = require('express');
var { Seek } = require('../modules/SeekScheme.js');
var router = express.Router();
var WSM = require('../modules/WebSocketManager.js');

io.on('connection', async function(socket){

	if(typeof socket.request.session.passport !== 'undefined'){
		socket.name = socket.request.session.passport.user.alias;
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
 	    previousSocket.join(game.id, () => console.log('joined'))
 		socket.join(game.id, () => console.log('joined'))
 		WSM.setRoom(previousSocket, game.id);
 		WSM.setRoom(socket, game.id);
 		io.to(game.id).emit("joinGame", game)	
 	});

 	socket.on('disconnect', function(){
 		Seek.removeByUserAlias(socket.name);
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
		rating: req.user.rating
		});

		game.save(function(err){
			if(err) console.log(err);
			res.status(200).send(game);
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
