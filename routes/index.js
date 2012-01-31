/*
 * GET home page.
 */
var shopList = require('../models/shoplist.js');
var user = require('../models/user.js');
var notify = require('../notify.js');

exports.authUser = function (user) {

}

exports.index = function (req, res) {
    if (req.session.auth && req.session.auth.loggedIn) {
        req.session.userId = req.session.auth.google.user.id;

        shopList.getShopListsForUser(req.session.userId, function (result) {
            res.render('index.html', { title:'Main', layout:'main', preloadShopLists:result });
        });

    } else {
        res.render('index.html', { title:'Main', layout:'main' });
    }
};

exports.about = function (req, res) {
    notify.sendNotifyEmail(req.session.auth.google.user.id);
    res.render('about.html', { title:'About', layout:'main' })
};

exports.addShopList = function (everyauth, now, shopListName) {
    shopList.createShopList(everyauth.google.user.id, shopListName, now.displayPollData);
}

exports.deleteShopList = function (everyauth, now, shopListId) {
    shopList.deleteShopList(everyauth.google.user.id, shopListId, now.displayPollData);
}

exports.getShopLists = function (everyauth, now) {
    shopList.getShopListsForUser(everyauth.google.user.id, now.displayPollData);
}

exports.getShopList = function (everyauth, now, shopListId) {
    shopList.getShopList(everyauth.google.user.id, shopListId, now.displayPollItemsData, now.displayPollData);
}

exports.addItem = function (everyauth, now, shopListId, itemName) {
    shopList.addItemToShopList(everyauth.google.user.id, shopListId, itemName, now.displayPollItemsData);
}

exports.deleteItem = function (everyauth, now, shopListId, itemId) {
    shopList.deleteItemFromShopList(everyauth.google.user.id, shopListId, itemId, now.displayPollItemsData);
}

exports.buyItem = function (everyauth, now, shopListId, itemId) {
    shopList.buyItemFromShopList(everyauth.google.user.id, shopListId, itemId, now.displayPollItemsData);
}

exports.addCoOwner = function (everyauth, now, shopListId, coOwnerId) {
    shopList.addCoOwnerForShopList(everyauth.google.user.id, shopListId, coOwnerId, now.displayPollData);
}

exports.deleteCoOwner = function (everyauth, now, shopListId, coOwnerId) {
    shopList.deleteCoOwnerFromShopList(everyauth.google.user.id, shopListId, coOwnerId, now.displayPollData);
}