/*
 * GET home page.
 */
var shopList = require('../models/shoplist.js');
var user = require('../models/user.js');
var notify = require('../notify.js');

exports.authUser = function (user) {

}

exports.index = function (req, res) {
    console.log("index page");
    if (req.session.auth && req.session.auth.loggedIn) {
        req.session.userId = req.session.auth.google.user.id;

        shopList.getShopListsForUser(req.session.userId, function (result) {
            res.render('index.html', { title:'Main', layout:'main', preloadShopLists:JSON.parse(result) });
        });

    } else {
        res.render('index.html', { title:'Main', layout:'main' });
    }
};

exports.about = function (req, res) {
    notify.sendNotifyEmail(req.session.auth.google.user.id);
    res.render('about.html', { title:'About', layout:'main' })
};

exports.addShopList = function (everyauth, callBack, shopListName) {
    shopList.createShopList(everyauth.google.user.id, shopListName, callBack);
}

exports.deleteShopList = function (everyauth, callBack, shopListId) {
    shopList.deleteShopList(everyauth.google.user.id, shopListId, callBack);
}

exports.getShopLists = function (everyauth, callBack) {
    shopList.getShopListsForUser(everyauth.google.user.id, callBack);
}

exports.getShopList = function (everyauth, callBack, fallBack, shopListId) {
    shopList.getShopList(everyauth.google.user.id, shopListId, callBack, fallBack);
}

exports.addItem = function (everyauth, callBack, shopListId, itemName) {
    shopList.addItemToShopList(everyauth.google.user.id, shopListId, itemName, callBack);
}

exports.deleteItem = function (everyauth, callBack, shopListId, itemId) {
    shopList.deleteItemFromShopList(everyauth.google.user.id, shopListId, itemId, callBack);
}

exports.buyItem = function (everyauth, callBack, shopListId, itemId) {
    shopList.buyItemFromShopList(everyauth.google.user.id, shopListId, itemId, callBack);
}

exports.addCoOwner = function (everyauth, callBack, shopListId, coOwnerId) {
    shopList.addCoOwnerForShopList(everyauth.google.user.id, shopListId, coOwnerId, callBack);
}

exports.deleteCoOwner = function (everyauth, callBack, shopListId, coOwnerId) {
    shopList.deleteCoOwnerFromShopList(everyauth.google.user.id, shopListId, coOwnerId, callBack);
}