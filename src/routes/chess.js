var express = require('express');
var { Seek } = require('../modules/SeekScheme.js');
var { WSM } = require('./seek.js');
var router = express.Router();

io.on('connection', function(socket){

	socket.on('setRoom', function(data){
		WSM.setRoom(socket, data);
		socket.join(data);
	});

	socket.on('piece moved', function(msg){
		var namedSocket = WSM.findSocketByName(socket.request.session.passport.user.alias);
		var Room = WSM.getRoom(namedSocket);	
		console.log(Room);
		io.to(Room).emit('piece moved', msg);
	})

})

router.get('/:gameId', (req,res,next) => {
	Seek.findOne({gameId: req.params.gameId}, (err,game) => {
		if(err) next(err);

		if(game){
			//res.cookie
			res.render('chess');
		}
		else next();
	})
});

module.exports = router;