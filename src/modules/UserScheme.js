var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

try{
  mongoose.connect('mongodb://localhost/users');
}catch(e){
  mongoose.connect('mongodb+srv://cluster0-ftw6k.mongodb.net/test?retryWrites=true');
}


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
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    set: toLower
  },
  password: {
    type: String,
    required: true,
  },
  passwordConfirm: {
    type: String,
    required: true,
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
  })
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

  user.findById(id, callback);
}

var User = mongoose.model('users', UserSchema);




module.exports = User;