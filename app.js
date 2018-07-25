var express = require('express');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var { check, validationResult } = require('express-validator/check');
var expressSession = require('express-session');	
var bcrypt = require('bcrypt');
var cookieParser = require('cookie-parser');
var path = require('path');
var flash = require('connect-flash');
var passport = require('passport');
var { User } = require('./src/modules/UserScheme.js');
var Chess = require('./node_modules/chess.js/chess').Chess;
var app = express();
var http = require('http').Server(app);
global.io = require('socket.io')(http);


// Routes
var indexView = require('./src/routes/index.js');
var chessView = require('./src/routes/chess.js');
var chatView = require('./src/routes/chat.js');
var signUpView = require('./src/routes/sign-up.js');
var authView = require('./src/routes/auth.js');
var {seekView} = require('./src/routes/seek.js');


// View engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

var session = expressSession({secret: 'max', saveUninitialized: false, resave: false});
//Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(cookieParser('sess1'));
app.use(session);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

io.use(function(socket,next){
    session(socket.request, {}, next);
})

app.use(function(req, res, next){
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
	next();
});

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'https://fierce-fortress-40988.herokuapp.com');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use('/', indexView);
app.use('/game', chessView);
app.use('/chat', chatView);
app.use('/register', signUpView);
app.use('/seek', seekView);
app.use('/', authView);

app.use(function(err, req, res, next) {
    console.log(err);
    next();
});

app.use((req,res,next) => {
	res.status(404);
	res.render('404');
});

http.listen(process.env.PORT || 3000)




