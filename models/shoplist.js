var mongoose = require('mongoose');
var Schema = mongoose.Schema
var ObjectId = Schema.ObjectId;

var Item = require('./item.js');
var ItemModel = mongoose.model('Item', Item);

var ShopList = exports = module.exports = new Schema({
    _id         : ObjectId
    , name      : String
    , owner     : String
    , coOwners  : [String]
    , items     : [Item]
});

var ShopListModel = exports.model = mongoose.model('ShopList', ShopList);

checkError = function(error, data, callBack) {
    callBack(data);
    if (error != null) {
        console.error(error);
    }
}

exports.getShopList = function(userId, shopListId, callBack, failBack) {
    ShopListModel.findOne({
                $or:[
                    {owner: userId},
                    { coOwners: { $in: [userId] }}
                ],
                _id: shopListId},
            function(error, result) {
                isShopListFound(error, result, function() {
                    callBack(result);
                }, failBack);
            });
}

exports.getShopListsForUser = function(userId, callBack) {
    ShopListModel.find({
                $or:[
                    {owner: userId},
                    { coOwners: { $in: [userId] }}
                ] }
            , ['_id', 'name', 'owner'])
            .exec(function(error, result) {
                isShopListFound(error, result, callBack);
            });
}


exports.createShopList = function(userId, shopListName, callBack) {
    var shopList = new ShopListModel();
    shopList.name = shopListName;
    shopList.owner = userId;
    saveShopList(shopList, function() {
        exports.getShopListsForUser(userId, callBack);
    });
}

exports.deleteShopList = function(userId, shopListId, callBack) {
    ShopListModel.find({})
            .where('_id', shopListId)
            .where('owner', userId)
            .remove(function() {
                exports.getShopListsForUser(userId, callBack);
            });
}

exports.addItemToShopList = function(userId, shopListId, itemName, callBack) {
    exports.getShopList(userId, shopListId, function(shopList) {
        var item = new ItemModel();
        item.name = itemName;
        item.isBought = false;
        shopList.items.push(item);
        saveShopList(shopList, callBack);
    });
}

exports.deleteItemFromShopList = function(userId, shopListId, itemId, callBack) {
    exports.getShopList(userId, shopListId, function(shopList) {
        shopList.items.id(itemId).remove();
        saveShopList(shopList, callBack);
    });
}

exports.buyItemFromShopList = function(userId, shopListId, itemId, callBack) {
    exports.getShopList(userId, shopListId, function(shopList) {
        shopList.items.id(itemId).isBought = true;
        saveShopList(shopList, callBack);
    });
}

exports.addCoOwnerForShopList = function(userId, shopListId, coOwnerId, callBack) {
    exports.getShopList(userId, shopListId, function(shopList) {
        shopList.coOwners.push(coOwnerId);
        saveShopList(shopList, callBack);
    });
}


exports.deleteCoOwnerFromShopList = function(userId, shopListId, coOwnerId, callBack) {
    exports.getShopList(userId, shopListId, function(shopList) {
        shopList.coOwners.remove(coOwnerId);
        saveShopList(shopList, callBack);
    });
}

saveShopList = function(shopList, callBack) {
    shopList.save(function() {
        callBack(shopList);
    });
}

isShopListFound = function(shopList, callBack, failBack) {
    if (shopList == null) {
        console.error('shopList not found');
        failBack();
    } else {
        callBack();
    }
}
