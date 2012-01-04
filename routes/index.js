
/*
 * GET home page.
 */
var shopList = require('../models/shoplist.js');

exports.index = function(req, res){
	if(req.session.auth && req.session.auth.loggedIn) {
  		req.session.userId = req.session.auth.google.user.id;
	  }
  res.render('index.html', { title: 'Main', layout: 'main' })
};

exports.about = function(req, res){
  res.render('about.html', { title: 'About', layout: 'main' })
};

exports.addShopList = function(everyauth, shopListName, now) {
		shopList.create(everyauth, shopListName, now.displayPollData);
}

exports.deleteShopList = function(everyauth, id, now) {
		shopList.delete(everyauth, id, now.displayPollData);
}

exports.getShopLists = function(everyauth, now) {
		shopList.getAll(everyauth.google.user.id, now.displayPollData);
}