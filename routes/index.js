/*
 * GET home page.
 */
var shopList = require('../models/shoplist.js');


exports.index = function(req, res) {
    if (req.session.auth && req.session.auth.loggedIn) {
        req.session.userId = req.session.auth.google.user.id;

        shopList.getAll(req.session.userId, function() {
            res.render('index.html', { title: 'Main', layout: 'main'  });
        });

    } else {
        res.render('index.html', { title: 'Main', layout: 'main' });
    }
};

exports.about = function(req, res) {
    res.render('about.html', { title: 'About', layout: 'main' })
};

exports.addShopList = function(everyauth, shopListName, now) {
    shopList.createShopList(everyauth.google.user.id, shopListName, now.displayPollData);
}

exports.deleteShopList = function(everyauth, id, now) {
    shopList.deleteShopList(everyauth.google.user.id, id, now.displayPollData);
}

exports.getShopLists = function(everyauth, now) {
    shopList.getShopListsForUser(everyauth.google.user.id, now.displayPollData);
}

exports.getShopList = function(everyauth, now, id) {
    shopList.getShopList(everyauth.google.user.id, id, now.displayPollItemsData, now.displayPollData);
}

exports.addItem = function(everyauth, id, itemName, now) {
    shopList.addItemToShopList(everyauth.google.user.id, id, itemName, now.displayPollItemsData);
}

exports.deleteItem = function(everyauth, listId, id, now) {
    shopList.deleteItemFromShopList(everyauth.google.user.id, listId, id, now.displayPollItemsData);
}

exports.buyItem = function(everyauth, listId, id, now) {
    shopList.buyItemFromShopList(everyauth.google.user.id, listId, id, now.displayPollItemsData);
}

exports.addCoOwner = function(everyauth, id, itemName, now) {
    shopList.addCoOwnerForShopList(everyauth.google.user.id, id, itemName, now.displayPollItemsData);
}

exports.deleteCoOwner = function(everyauth, listId, id, now) {
    shopList.deleteCoOwnerFromShopList(everyauth.google.user.id, listId, id, now.displayPollItemsData);
}