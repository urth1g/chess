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
var User = require('./src/modules/UserScheme.js');
var Chess = require('./node_modules/chess.js/chess').Chess;
var app = express();
var http = require('http').Server(app);
global.io = require('socket.io')(http);


// Routes
var index = require('./src/routes/index.js');
var chess = require('./src/routes/chess.js');
var chat = require('./src/routes/chat.js');
var signUp = require('./src/routes/sign-up.js');
var auth = require('./src/routes/auth.js');


// View engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(expressSession({secret: 'max', saveUninitialized: false, resave: false}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(flash());

app.use(function(req, res, next){
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
	next();
});

app.use('/', index);
app.use('/chess', chess);
app.use('/chat', chat);
app.use('/register', signUp);
//app.use('/create-user', signUp);
app.use('/', auth);

app.use(function(err, req, res, next) {
    console.log(err);
    next();
});

app.use((req,res,next) => {
	res.status(404);
	res.render('404');
});

http.listen(process.env.PORT || 3000)




