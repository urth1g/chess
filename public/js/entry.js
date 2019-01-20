import { socket, SendInfo } from "./socket.js";
import React from 'react';
import {render} from 'react-dom';
import { Clocks } from "../../src/components/Clock.jsx";
import { dispatcher } from "../../src/components/TimeStore.jsx";
import CustomChess from "./CustomChess.js";

var gameId = document.location.pathname.split('/')[2];
var white = null;
var black = null;
var user = null;
var audio = new Audio("../audio/chess.mp3");
// Fetch current user so you can check if his name corresponds to the player turn

fetch('/user',{ credentials : 'same-origin' })
.then(res => res.json())
.then(data => { 
  if(typeof data.alias !== 'undefined')
    user = data.alias
});

// Join two sockets into the same room
socket.emit("setRoom",gameId);
$(document).ready(() => {

  var resigned = false;
  var board,
  game = new CustomChess(),
  statusEl = $('#status'),
  fenEl = $('#fen'),
  pgnEl = $('#pgn');

  $.post(gameId, {action:'LOAD_MOVES'}, function(data){
    if(data !== false){
      game.load(data.fen);
      game.load_pgn(data.pgn);
      board.position(data.fen, false);
    }
  });

  $.post(gameId, async function(data){
    white = data.white;
    black = data.black;
    updateStatus();
    if(user === black)
      board.flip();
  });


// do not pick up pieces if the game is over
// only pick up pieces for the side to move
var onDragStart = function(source, piece, position, orientation) {
  if (game.game_over() === true ||
      user === null ||
      game.game_resigned() === true ||
      game.game_done() === true || 
      (user === black && (piece.search(/^w/) !== -1)) ||
      (user === white && (piece.search(/^b/) !== -1))) {
    return false;
  }
};

var onMoveEnd = function(oldPosition, newPosition){
  if(game.preMoveExists() === true){
    var move = game.move(game.preMove());

    if (move === null) return 'snapback';

    socket.emit('piece moved', move);
    $.post(gameId, {action: 'GENERATE_MOVES', payload: JSON.stringify({fen: game.fen(), pgn: game.pgn() })});

    var finished = updateStatus();
    if(typeof finished === 'object')
      $.post(gameId, finished);    
    }
}
var onChange = function(oldPosition, newPosition) { 
  updateStatus();
};

var onDrop = function(source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  });

  // illegal move
  if (move === null) return 'snapback';

  socket.emit('piece moved', move);
  dispatcher.dispatch({type:'UPDATE_TIME'});
  socket.emit("stopTimer");

  $.post(gameId, {action: 'GENERATE_MOVES', payload: JSON.stringify({fen: game.fen(), pgn: game.pgn() })});

  var finished = updateStatus();
  if(typeof finished === 'object')
    $.post(gameId, finished);
};

// update the board position after the piece snap 
// for castling, en passant, pawn promotion
var onSnapEnd = function() {
  board.position(game.fen());
};

var updateStatus = function() {

  var status = '';

  var players = [white,black];
  var moveColor = white;
  if (game.turn() === 'b') {
    moveColor = black;
  }

  // checkmate?
  if (game.in_checkmate() === true) {
    status = 'Game over, ' + moveColor + ' is in checkmate.';
    var _winner = players.filter(x => x !== moveColor)[0];
    //$.post(gameId, { action:'SORT_MOVES', winner: _winner, loser: moveColor} );
    statusEl.html(status);
    fenEl.html(game.fen());
    pgnEl.html(game.pgn());    
    return { action: 'SORT_MOVES', winner: _winner, loser: moveColor};
  }

  // draw?
  else if (game.in_draw() === true) {
    status = 'Game over, drawn position';
    //$.post(gameId, { action:'SORT_MOVES', winner: 'DRAW'} );
    statusEl.html(status);
    fenEl.html(game.fen());
    pgnEl.html(game.pgn());    
    return { action: 'SORT_MOVES', winner:'DRAW', players:players};
  }

  // resigned?
  else if(game.game_resigned() === true){

  }

  // game still on
  else {
    status = moveColor + ' to move';

    // check?
    if (game.in_check() === true) {
      status += ', ' + moveColor + ' is in check';
    }
  }

  if(game.game_done() !== true || game.game_resigned() !== true){
    statusEl.html(status);
  }
  fenEl.html(game.fen());
  pgnEl.html(game.pgn());
};

  var cfg = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    onChange: onChange,
    onMoveEnd: onMoveEnd
  };

  board = ChessBoard('board', cfg);


  $('#flip').click(() => board.flip());
  $('#resign').click(() => { 
    game.set_resign();
    var players = [white,black];
    var _winner = players.filter(x => x !== user)[0]
    $.post(gameId, { action:'SORT_MOVES', winner: _winner, loser: user} );
    fenEl.html(game.fen());
    pgnEl.html(game.pgn());
    dispatcher.dispatch({type:'STOP_TIMER'});
    socket.emit("GAME_RESIGNED", user); 
  });


  socket.on("GAME_RESIGNED", function(user){
    status = user + ' resigned';
    dispatcher.dispatch({type:'STOP_TIMER'});
    statusEl.html(status);
  });

  socket.on('piece moved', function(msg){
    game.move(msg);
    board.position(game.fen());
    audio.play();
    dispatcher.dispatch({type: 'SWITCH_PLAYER'});
  });

  socket.on("WHITE_WON", function(players){
    var obj = { action: 'SORT_MOVES', winner: players[0], loser: players[1] };
    $.post(gameId, obj);
    game.set_done();
    dispatcher.dispatch({type:'STOP_TIMER'});
    statusEl.html(`Game over, ${players[0]} won`);
  });

  socket.on("BLACK_WON", function(players){
    var obj = { action: 'SORT_MOVES', winner: players[0], loser: players[1] };
    $.post(gameId, obj);
    game.set_done();
    dispatcher.dispatch({type:'STOP_TIMER'});
    statusE1.html(`Game over, ${players[0]} won`);
  });

  $.post(`${gameId}/result`, async function(data){
    if(typeof data === 'string'){
      if(data !== 'DRAW'){
        statusEl.html(`Game over, ${data} won`);
        game.set_done();
        return;
      }
      else{
        statusEl.html(`Game drawn`);
        game.set_done();
        return;
      }
    }
  })  

  $("form").submit(function(e){
    e.preventDefault();
    var m = $("#m").val();
    socket.emit("chat message", {msg: m, sender: user});
    $("#m").val('');
  })

  socket.on('chat message', function(msg){
    $('#messages').append($('<li>').append(`<b>${msg.sender}</b>: ${msg.msg}`));
  }); 
  render(<Clocks />, document.querySelector("#clock"));
});
