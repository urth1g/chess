import React from 'react';
import {EventEmitter} from "events";
import { timeStore, dispatcher } from "./TimeStore.jsx";
import { socket } from "../../public/js/socket.js";

class Clock extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			totalTime: this.props.time,
			minutes: null,
			seconds: null
		};
	}

	componentDidMount(){
		this.processTime();
	}

	processTime(){
		var minutes = Math.floor(this.state.totalTime/60);
		var seconds = this.state.totalTime % 60;
		this.setState((state,props) => {
			return { minutes: minutes, seconds: seconds}
		})

		if(this.state.totalTime == 0){
			//dispatcher.dispatch({type: 'GAME_ENDED'});
		}
	}

	componentDidUpdate(prevProps){
		if(this.props.time !== prevProps.time){
			this.setState({
				totalTime: Math.round(this.props.time) 
			}, function () {
				this.processTime();
			});
		}
	}

	render(){
		var seconds = this.state.seconds;
		var showingSeconds = null;
		if(seconds < 10){
			showingSeconds = ('0' + this.state.seconds).slice(-2)
		}else{
			showingSeconds = this.state.seconds;
		}
		return(
			<div className={this.props.className}>
				{this.state.minutes !== null &&
					<h1>{('0' + this.state.minutes).slice(-2) + ":" + showingSeconds}</h1>
				}
			</div>
		)
	}
}

window.timeStore = timeStore;

class Clocks extends React.Component{
	constructor(props){
		super(props);
		this.whiteClock = React.createRef();
		this.blackClock = React.createRef();
		this.state = { 'time' : timeStore.getAll() };
	}

	componentDidMount(){
		var _this = this;
		dispatcher.dispatch({type: 'GET_TIME'});
		//dispatcher.dispatch({type: 'UPDATE_TIME'});

		timeStore.on("change", () => {
			_this.setState({
				time: timeStore.getAll()
			});
		});

		socket.on("timeChanged", function(data){
			dispatcher.dispatch({type: 'SET_TIME', payload:JSON.parse(data)});
		});

	    socket.on("stopTimer", function(){
	    	console.log("timerStopped");
	    	dispatcher.dispatch({type:'STOP_TIMER'});
	  	});
	}
	render(){
		window.clock = this.whiteClock;
		return(
			<div className="clocks">
				<Clock time={this.state.time.whiteTime} ref={this.whiteClock} className="whiteClock" />
				<Clock time={this.state.time.blackTime} ref={this.blackClock} className="blackClock" />
			</div>
		)
	}
}
module.exports = {Clocks};