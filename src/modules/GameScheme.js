var mongoose = require('mongoose');
var _ = require('lodash');

var GameSchema = new mongoose.Schema({
	gameId: {
		type:String,
		trim:true,
	},
	whitePlayer:{
		type:String,
		trim:true
	},
	blackPlayer: {
		type: String,
		trim: true
	},
	whiteRating: {
		type: Number,
		trim: true
	},
	blackRating:{
		type: Number,
		trim: true
	},
	amount:{
		type: String,
		trim: true
	},
	moves:{
		type: Object,
		trim:true
	},
	fen:{
		type: Object,
		trim:true
	},
	winner:{
		type:String,
		trim: true
	},
	loser:{
		type:String,
		trim: true
	},
	whiteTime:{
		type: Number,
		trim: true
	},
	blackTime: {
		type: Number,
		trim: true
	}
});

GameSchema.statics.findByGameId = function(id,cb){
	this.findOne({gameId: id}, function(err,game){
		if(err) cb(err);

		if(game){
			cb(null, game);
		}
	});
}

GameSchema.statics.updateWinner = function(id,_winner,_loser,cb){
	if(typeof _winner === 'string' && typeof _loser === 'string'){
		this.findOneAndUpdate({gameId: id},{ $set: {winner: _winner, loser: _loser}},function(err,game){
			if(err) cb(err);

			if(game){
				cb(null, game);
			}
		});	
	}

}

GameSchema.statics.changeBlackTime = function(id,amount,cb){
  this.findOneAndUpdate({ gameId: id }, { $inc: { blackTime: amount }}, {new: true}, function(err,doc){
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

GameSchema.statics.changeWhiteTime = function(id,amount,cb){
  this.findOneAndUpdate({ gameId: id }, { $inc: { whiteTime: amount }}, {new: true}, function(err,doc){
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

var Game = mongoose.model('games', GameSchema, 'games');

module.exports = { Game }