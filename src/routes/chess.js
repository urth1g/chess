var express = require('express');
var router = express.Router();

io.on('connection', function(socket){
	socket.on('piece moved', function(msg){
		socket.broadcast.emit('piece moved', msg)
	})
})

router.get('/', (req,res) => {
	//console.log('asd');
	res.render('chess')
});

module.exports = router;