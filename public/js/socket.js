var socket = io();

function SendInfo(board,socket,game){
	socket.on('piece moved', function(msg){
		game.move(msg);
  		board.position(game.fen());
	});
}

export { SendInfo, socket };