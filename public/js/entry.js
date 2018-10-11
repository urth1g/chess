import { socket, SendInfo } from "./socket.js";
import React from 'react';
import {render} from 'react-dom';
import { Clock } from "../../src/components/Clock.jsx";


console.log(Clock);
console.log("ASD");

var gameId = document.location.pathname.split('/')[2];
var white = null;
var black = null;
var user = null;


fetch('/user',{ credentials : 'same-origin' })
.then(res => res.json())
.then(data => user = data.alias);


socket.emit("setRoom",gameId);
$(document).ready(() => {
  console.log(document.querySelector("#clock"))

  var resigned = false;
  var board,
  game = new Chess(),
  statusEl = $('#status'),
  fenEl = $('#fen'),
  pgnEl = $('#pgn');

  $.post(gameId, {action:'LOAD_MOVES'}, function(data){
    if(data !== false){
      game.load(data.fen);
      game.load_pgn(data.pgn);
      board.position(data.fen);
    }
  });

  $.post(gameId, async function(data){
    white = data.white;
    black = data.black;
    updateStatus();
    if(user === black)
      board.flip();
  });
  //var board1 = ChessBoard('board', 'start');


// do not pick up pieces if the game is over
// only pick up pieces for the side to move
var onDragStart = function(source, piece, position, orientation) {
  if (game.game_over() === true ||
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

  console.log('hey');

  socket.emit('piece moved', move);
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
    status = user + ' resigned';
    var _winner = players.filter(x => x !== user)[0]
    $.post(gameId, { action:'SORT_MOVES', winner: _winner, loser: user} );
    statusEl.html(status);
    fenEl.html(game.fen());
    pgnEl.html(game.pgn());
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
  $('#resign').click(() => { game.set_resign();updateStatus()})
  SendInfo(board,socket,game);

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

  render(<Clock />, document.querySelector("#clock"));
});
