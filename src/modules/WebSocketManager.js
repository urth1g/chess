var { EventEmitter } = require("events");

class WebSocketManager extends EventEmitter{
	constructor(){
		super();
		this.sockets = [];
	}

	addSocket(socket){
		this.sockets.push(socket);
		this.emit("change",this.sockets);
	}

	getRoom(socket){
		return socket.room;
	}

	setRoom(socket,room){
		var socket = this.sockets.findIndex(x => x == socket);
		this.sockets[socket].room = room;
		this.emit("change", this.sockets);
	}

	socketDisconnected(socket){
		this.sockets = this.sockets.filter(x => x != socket);
		this.emit("change", this.sockets);
	}

	findSocketByName(name){
		var socket = this.sockets.filter(x => x.name == name );
		return socket[0];
	}
	findSocketRatingByName(name){
		var socket = this.sockets.filter(x => x.name == name );
		return socket[0].rating;		
	}
}

var WSM = new WebSocketManager();

WSM.on("change", data => WSM.sockets = data);

module.exports = WSM;