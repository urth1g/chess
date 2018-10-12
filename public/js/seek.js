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
		var moneySpan = $(".money span");
		
		
		$.ajax({
			type: 'POST',
			url: '/seek',
			data: {time: time, money: money, color:color},
		}).then((data) => {
			console.log(data);
			if(data.error == true){
				$('.alert').stop(true,true).show(350).delay(1000).hide(350);
			}else{
				moneySpan.html((+moneySpan.html() - money.substr(0, money.length - 1)).toFixed(2))
				socket.emit('newGame', data);		
			}
		});
		return false;
	})

	// GET back here
	socket.on('newGame',function (game){
		dispatcher.dispatch({type:'LOAD_GAME', payload:game})
	});

	socket.on('joinGame', function(game){
		setTimeout( () => window.location.pathname = game.href, 250);
	});

	socket.on('disconnected', function(user){
		dispatcher.dispatch({type:'DELETE_GAME',payload:user})
	});

	socket.on('error', function(){
		$('.alert').stop(true,true).show(350).delay(1000).hide(350);
	});

	render(<MyComponent />, document.querySelector('.Games'))

});