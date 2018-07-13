var mongoose = require('mongoose');
var { randomString } = require('./UserScheme.js');

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
	}
});

SeekSchema.pre('save', async function(next){
	this.gameId = await randomString(15);
});

SeekSchema.statics.removeByUserAlias = function(userAlias){
	var seek = this;
	seek.deleteOne({userAlias: userAlias},(err) => {
		if(err) console.log(err);
	});
}
var Seek = mongoose.model('seek', SeekSchema, 'seek');

module.exports = { Seek }
