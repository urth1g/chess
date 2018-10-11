var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var uri = 'mongodb+srv://urth:ikariam2@cluster0-ftw6k.mongodb.net/chesscash';
mongoose.connect(uri, { useNewUrlParser: true });
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

function toFixed(value, precision) {
    var power = Math.pow(10, precision || 0);
    return Number(Math.round(value * power) / power);
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
  },
  amount: {
    type: Number,
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

  user.amount = 0;
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

UserSchema.statics.findUserRating = function(alias,cb){
  var user = this;

  user.findOne({alias: alias}, 'rating', function(err,game){
    if(err) console.log(err);

    if(game){
      cb(game);
    }
  })
}

UserSchema.statics.findByUserAlias = function(alias,cb){
  var user = this;

  user.findOne({alias: alias}, function(err,game){
    if(err) console.log(err);

    if(game){
      cb(game);
    }
  })
}


UserSchema.statics.changeAmount = function(_alias, _amount,cb){
  this.findOneAndUpdate({ alias: _alias }, { $inc: { amount: _amount }}, {new: true}, function(err,doc){
    if(err){
      cb(err);
    }
    if(doc){
      if(typeof cb === 'function'){
        cb(null,doc);
      }
    }
  })
}

UserSchema.statics.returnAmount = function(_alias,cb){
  this.findOne({alias: _alias}, 'amount', function(err,amount){
    if (err) 
      cb(err);
    else
      cb(null,amount);
  })
}

UserSchema.statics.roundAmount = function(_alias, _amount, cb){
  this.findOneAndUpdate({alias: _alias}, { $set:{ amount: toFixed(_amount, 2)}}, function(err,doc){
    if(err)
      cb(err);
    else
      cb(null, doc);
  });
}
var User = mongoose.model('users', UserSchema);

module.exports = { User, randomString, emailStr };