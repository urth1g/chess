import "isomorphic-fetch"
import promise from 'es6-promise'
import React from 'react';
import {render} from 'react-dom';
import {MyComponent,dispatcher} from '../../src/components/seekDiv.jsx';
import {socket} from './socket.js';

promise.polyfill();
$(function() {

	$('#seekForm').on('submit', (e) => {
		e.preventDefault();
		var time = $('#time').val();
		var money = $('#money').val();
		var color = $('input[name="color"]:checked').val();
		$.ajax({
			type: 'POST',
			url: '/seek',
			data: {time: time, money: money, color:color},
		}).then((data) => {
			console.log(data)
			socket.emit('newGame', data)
		});
		return false;
	})

	socket.on('newGame',function (game){
		dispatcher.dispatch({type:'LOAD_GAME', payload:game})
	});

	socket.on('joinGame', function(game){
		window.location.pathname = game.href;
	});

	socket.on('disconnected', function(user){
		dispatcher.dispatch({type:'DELETE_GAME',payload:user})
	});

	render(<MyComponent />, document.querySelector('.Games'))

});