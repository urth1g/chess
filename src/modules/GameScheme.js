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
	}
});

var Game = mongoose.model('games', GameSchema, 'games');

module.exports = { Game }