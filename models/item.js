var mongoose = require('mongoose');
var Schema = mongoose.Schema
var ObjectId = Schema.ObjectId;


var Item = module.exports = new Schema({
      name     : String
    , isBought : Boolean
});

var ItemModel = exports.model = mongoose.model('Item', Item);
