var mongoose = require('mongoose');
var Schema = mongoose.Schema
var ObjectId = Schema.ObjectId;
var fs = require('fs');

var Item = require('./item.js');
var ItemModel = mongoose.model('Item', Item);

var ShopList = exports = module.exports = new Schema({
	_id		 : ObjectId
  , name     : String
  , owner	 : String
  , items	 : [Item]
});

var ShopListModel = exports.model  = mongoose.model('ShopList', ShopList);



exports.get = function(id, fn){
  ShopListModel.findById(id, function(err, doc) {
		checkError(err, doc, fn);
	});
};

exports.getAll = function(id, fn) {
	ShopListModel.find({owner: id}, function(err, doc) {
		checkError(err, doc, fn);
	});
}

checkError = function(err, doc, fn) {
		if(err == null) {
			fn(doc);
		} else {
			fn(null);
  			console.log(err);
		}
}

exports.create = function(everyauth, name, fn) {
	var shopList = new ShopListModel();
		shopList.name = name;

		console.log(everyauth.google.user);
		shopList.owner = everyauth.google.user.id;
		shopList.save(function(err) {
			checkError(err, null, function() {
				exports.getAll(everyauth.google.user.id, fn);
			});
		});
}
/*
exports.addPhoto = function(albumId, filename, file, res) {

	exports.get(albumId, function(album) {
		if(album == null) {
			console.log('Album not found');
		} else {
			var image = new ImageModel();
			image.name = filename;
			image.type = file.type;
			image.content = fs.readFileSync(file.path);
			if (album.images == null) {
				album.images = {};
			}
			album.images.push(image);
			album.isNew = false;
			album.save(function(err) {
				console.log(err);
				res.redirect('/admin');		
			});

		}
	});

}*/