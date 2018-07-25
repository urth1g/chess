import { socket, SendInfo } from "./socket.js";

var white = null;
var black = null;
var user = null;

$.post(document.location.pathname.split('/')[2], async function(data){
  white = data.white;
  black = data.black;
});

fetch('/user',{ credentials : 'same-origin' })
.then(res => res.json())
.then(data => user = data.alias);

socket.emit("setRoom",document.location.pathname.split('/')[2]);
$(document).ready(() => {

  //var board1 = ChessBoard('board', 'start');
  var board,
  game = new Chess(),
  statusEl = $('#status'),
  fenEl = $('#fen'),
  pgnEl = $('#pgn');

// do not pick up pieces if the game is over
// only pick up pieces for the side to move
var onDragStart = function(source, piece, position, orientation) {
  console.log(piece.search(/^b/));
  console.log(piece.search(/^w/));
  console.log(piece);
  console.log(JSON.stringify(piece));
  if (game.game_over() === true ||
      (user === black && (piece.search(/^b/) !== -1)) ||
      (user === white && (piece.search(/^w/) !== -1))) {
    return false;
  }
};

var onChange = function(oldPosition, newPosition) {
  console.log(white,black);
  console.log("User: ", user);
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
  console.log('moved');
  updateStatus();
};

// update the board position after the piece snap 
// for castling, en passant, pawn promotion
var onSnapEnd = function() {
  board.position(game.fen());
};

var updateStatus = function() {
  var status = '';

  var moveColor = 'White';
  if (game.turn() === 'b') {
    moveColor = 'Black';
  }

  // checkmate?
  if (game.in_checkmate() === true) {
    status = 'Game over, ' + moveColor + ' is in checkmate.';
  }

  // draw?
  else if (game.in_draw() === true) {
    status = 'Game over, drawn position';
  }

  // game still on
  else {
    status = moveColor + ' to move';

    // check?
    if (game.in_check() === true) {
      status += ', ' + moveColor + ' is in check';
    }
  }

  statusEl.html(status);
  fenEl.html(game.fen());
  pgnEl.html(game.pgn());
};

  var cfg = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    onChange: onChange
  };

  board = ChessBoard('board', cfg);


  $('#flip').click(() => board.flip());

  SendInfo(board,socket,game);

  updateStatus();

});









