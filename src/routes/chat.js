var express = require('express');
var router = express.Router();

io.of('/chat').on('connection', function(socket){
  	socket.on('chat message', function(msg){
    	io.of('/chat').emit('chat message', msg)
 	});
});

router.get('/', (req,res) => {
	res.render('chat')
});

module.exports = router;