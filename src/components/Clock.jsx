import React from 'react';
import {EventEmitter} from "events";
import { Dispatcher } from "flux";

class Clock extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			totalTime: 60,
			minutes: null,
			seconds: null
		},
		this.updateTime = null;
		this.changeTime = this.changeTime.bind(this);
	}

	componentDidMount(){
		this.changeTime();
	}

	processTime(time){
		var minutes = Math.floor(time/60);
		var seconds = time % 60;
		this.setState((state,props) => {
			return { minutes: minutes, seconds: seconds}
		})

		console.log(this.state.minutes, this.state.seconds);
		if(time == 0)
			this.clearTime();
	}

	changeTime(){
		var that = this;
		this.updateTime = setInterval(function (){
			that.setState((state, props) => {
				return { totalTime: state.totalTime - 1 }
			});
			that.processTime(that.state.totalTime)
		}, 1000);
	}

	clearTime(){
		clearInterval(this.updateTime);
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

class Clocks extends React.Component{
	constructor(props){
		super(props);
	}

	render(){
		return(
			<div className="clocks">
				<Clock className="whiteClock" />
				<Clock className="blackClock" />
			</div>
		)
	}
}
module.exports = {Clocks};