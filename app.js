var express = require('express');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var path = require('path');
// var Chess = require('chess.js');


var Chess = require('./node_modules/chess.js/chess').Chess;

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// static
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

// View engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());

app.get('/', (req, res) => {
	res.render('index',{})
});

app.get('/chess', (req, res) => {
	res.render('chess',{})
});

app.get('/about', (req,res) => {
	res.render('about', {Test:'<span>123</span>'})
});

app.get('/chat', (req,res) => {
	res.render('chat')
});

	io.on('connection', function(socket){
  		socket.on('chat message', function(msg){
    	io.emit('chat message', msg)
 		});
	});

http.listen(3000, () => console.log("Listening on port 3000"));

