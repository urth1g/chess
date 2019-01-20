import { Dispatcher } from "flux";
import { EventEmitter } from "events";
import { socket } from "../../public/js/socket.js";

var dispatcher = new Dispatcher;

class TimeStore extends EventEmitter{
	constructor(props){
		super(props);
		this.time = {'whiteTime':0, 'blackTime':0};
		this.url = document.location.pathname.split('/')[2];
		this.whitePlayer = true;
		this.updateTime = null;
	}

	setUrl(_url){
		this.url = _url;
	}
	fetchTime(){
		var _this = this;
		$.ajax({
			url: 'https://fierce-fortress-40988.herokuapp.com/game/getTime/' + this.url,
			method: 'POST',
		}).then(function(data){
			data = JSON.parse(data);
			_this.time.whiteTime = data[0];
			_this.time.blackTime = data[1];
		}).then(function(){
			_this.emit("change");
		})
 	}

	changeTime(){
		var _this = this;
		this.updateTime = setInterval(function(){ 
			if(_this.whitePlayer == true){
				if(_this.time.whiteTime > 0){
					console.log("time reduced");
					socket.emit("REDUCE_WHITE_TIME", _this.url);
				}else{
					_this.clearTime();
					socket.emit("BLACK_WON", _this.url);
					_this.time.whiteTime = 0;
				}
			}else{
				console.log("time_reduced");
				if(_this.time.blackTime > 0){
					socket.emit("REDUCE_BLACK_TIME", _this.url);		
				}else{
					_this.clearTime();
					socket.emit("WHITE_WON", _this.url);
					_this.time.blackTime = 0;
				}
			}
		_this.emit("change");
		},100);
	}

	clearTime(){
		clearInterval(this.updateTime);
		this.updateTime = null;
	}

	getAll(){
    	return this.time;
	}

	handleActions(action){
	    if(action.type === 'GET_TIME'){
	    	this.fetchTime();
	    }
	    if(action.type === 'SWITCH_PLAYER'){
	    	//this.clearTime();
	    	this.whitePlayer = !this.whitePlayer;
	    	//this.changeTime();
	    }
	    if(action.type === 'UPDATE_TIME'){
	    	if(this.updateTime === null){
	    		this.changeTime();
	    	}
	    }
	    if(action.type === 'SET_TIME'){
	    	this.time.whiteTime = action.payload[0];
	    	this.time.blackTime = action.payload[1];
	    	this.emit("change");
	    }
	    if(action.type === 'STOP_TIMER'){
	    	this.clearTime();
	    }
	}
}

const timeStore = new TimeStore;
dispatcher.register(timeStore.handleActions.bind(timeStore));

window.dispatcher = dispatcher;

module.exports = { timeStore, dispatcher }