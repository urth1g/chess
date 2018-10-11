var mongoose = require('mongoose');
var { randomString } = require('./UserScheme.js');
var _ = require('lodash');

var SeekSchema = new mongoose.Schema({
	gameId: {
		type:String,
		trim:true,
	},
	userAlias:{
		type:String,
		trim:true
	},
	rating: {
		type: Number,
		trim: true
	},
	amount: {
		type: String,
		trim: true
	},
	time:{
		type: Number,
		trim: true
	},
	color:{
		type:String,
		trim:true
	}
});

SeekSchema.pre('save', async function(next){
	this.gameId = await randomString(15);
});

SeekSchema.statics.removeByUserAlias = function(userAlias,cb){
	var seek = this;
	seek.deleteOne({userAlias: userAlias},(err) => {
		if(err) console.log(err);
		
		if(typeof cb === 'function')
			cb();
	});
}

SeekSchema.statics.checkIfUserExists = function (userAlias,returnGame,cb){
	var seek = this;

	seek.findOne({userAlias: userAlias}, function(err,game){
		if(err){
			cb(err);
		}

		if(_.isEmpty(game)){
			cb(null);
		}

		if(returnGame === true && !_.isEmpty(game)){
			cb(null, game);
		}
	});
}

SeekSchema.statics.returnColor = function(userAlias,cb){
	this.findOne({userAlias: userAlias},'color', function(err,game){
		if(err) console.log(err);

		if(game){
			cb(game.color);
		}
	});
}

SeekSchema.statics.returnAmount = function(id,cb){
	this.findOne({gameId: id}, 'amount', function(err,amount){
		if (err) console.log(err);

		cb(amount.amount);
	})
}
var Seek = mongoose.model('seek', SeekSchema, 'seek');

module.exports = { Seek }
