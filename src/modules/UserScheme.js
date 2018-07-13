var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var uri = 'mongodb+srv://urth:ikariam2@cluster0-ftw6k.mongodb.net/chesscash';
mongoose.connect(uri);
mongoose.connection.on('error', (err) => {
  console.log(err);
})

var randomString = function(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

var emailStr = randomString(20);

function toLower (v) {
  return v.toLowerCase();
}

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    set: toLower
  },
  emailString:{
    type:String,
    unique: true,
    trim: true,
    set: toLower
  },
  canLogin:{
    type:Boolean,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    set: toLower
  },
  alias:{
    type:String,
    trim: true,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  passwordConfirm: {
    type: String,
    required: true,
  },
  rating: {
    type: Number
  }
});

UserSchema.pre('save', function (next) {
  var user = this;
  bcrypt.hash(user.password, 10, function (err, hash){
    if (err) {
      return next(err);
    }
    user.password = hash;
    user.passwordConfirm = hash;
    next();
  });

  user.emailString = emailStr;
  user.canLogin = false;
  user.rating = 1500;
});


UserSchema.methods.validPassword = function(pwd,cb){
  var user = this;
  bcrypt.compare(pwd, user.password, function(err,res){
    if(err) cb(err)

    cb(null, res);  
  })
}

UserSchema.methods.findById = function(id,cb){
  var user = this;

  user.findById(id, cb);
}

var User = mongoose.model('users', UserSchema);

module.exports = { User, randomString, emailStr };