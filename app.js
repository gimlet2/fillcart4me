/**
 * Module dependencies.
 */

var express = require('express')
        , routes = require('./routes')
        , everyauth = require('everyauth')
        , now = require("now")
        ;

everyauth.debug = true;

var usersById = {};
var nextUserId = 0;
var usersByGoogleId = {};
var usersByFbId = {};

function addUser(source, sourceUser) {
    var user;
    if (arguments.length === 1) { // password-based
        user = sourceUser = source;
        user.id = ++nextUserId;
        return usersById[nextUserId] = user;
    } else { // non-password-based
        user = usersById[++nextUserId] = {id: nextUserId};
        user[source] = sourceUser;
    }
    return user;
}

everyauth.google.scope('https://www.google.com/m8/feeds/')
        .appId('198255835595-o7t2gcjkqna9qe093rg6462t2l2hlugr.apps.googleusercontent.com')
        .appSecret('0ibrNhrLb5D27bOMzVXH3YFG')
        .findOrCreateUser(function (sess, accessToken, extra, googleUser) {
            googleUser.refreshToken = extra.refresh_token;
            googleUser.expiresIn = extra.expires_in;
            return usersByGoogleId[googleUser.id] || (usersByGoogleId[googleUser.id] = addUser('google', googleUser));
        })
        .redirectPath('/');

everyauth
        .facebook
        .appId("297137990339090")
        .appSecret("aca151877e0721b37733ea8868b75962")
        .findOrCreateUser(function (session, accessToken, accessTokenExtra, fbUserMetadata) {
            return usersByFbId[fbUserMetadata.id] ||
                    (usersByFbId[fbUserMetadata.id] = addUser('facebook', fbUserMetadata));
        })
        .redirectPath('/');

var sessionSecret = 'GFTYUrtyfygfT^&**uyhgiugiuyg67fyt';
var sessionStore = new express.session.MemoryStore;

var app = module.exports = express.createServer(
        express.cookieParser(),
        express.session({ secret: sessionSecret, store: sessionStore  })
);
var everyone = now.initialize(app);

app.register('html', require('ejs'));

app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
    app.use(everyauth.middleware());
});


// DB

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/consuming');

// Configuration
app.configure('development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    everyauth.google.appId('198255835595-o7t2gcjkqna9qe093rg6462t2l2hlugr.apps.googleusercontent.com')
            .appSecret('0ibrNhrLb5D27bOMzVXH3YFG')
});

app.configure('production', function() {
    app.use(express.errorHandler());
    everyauth.google.appId('198255835595.apps.googleusercontent.com')
            .appSecret('gpAeYLUaZWQxklj3oe4sUPwC').myHostname("http://fillcart4.me")
});

// Routes

everyauth.helpExpress(app);

app.get('/', routes.index);
app.get('/about', routes.about);


everyone.now.addShopList = function(shopListName) {
    loadSession(this, function(auth, now) {
        routes.addShopList(auth, now, shopListName);
    });
}

everyone.now.deleteShopList = function(shopListId) {
    loadSession(this, function(auth, now) {
        routes.deleteShopList(auth, now, shopListId);
    });
}

everyone.now.getShopLists = function() {
    loadSession(this, function(auth, now) {
        routes.getShopLists(auth, now);
    });
}

everyone.now.getShopList = function(shopListId) {
    loadSession(this, function(auth, now) {
        routes.getShopList(auth, now, shopListId);
    }, shopListId);
}

everyone.now.addItem = function(shopListId, itemName) {
    loadSession(this, function(auth, now) {
        routes.addItem(auth, now, shopListId, itemName);
    }, shopListId);

}

everyone.now.deleteItem = function(shopListId, itemId) {
    loadSession(this, function(auth, now) {
        routes.deleteItem(auth, now, shopListId, itemId);
    }, shopListId);
}

everyone.now.buyItem = function(shopListId, itemId) {
    loadSession(this, function(auth, now) {
        routes.buyItem(auth, now, shopListId, itemId);
    }, shopListId);
}

everyone.now.addCoOwner = function(shopListId, coOwnerId) {
    loadSession(this, function(auth, now) {
        routes.addCoOwner(auth, now, shopListId, coOwnerId);
    }, shopListId);

}

everyone.now.deleteCoOwner = function(shopListId, coOwnerId) {
    loadSession(this, function(auth, now) {
        routes.deleteCoOwner(auth, now, shopListId, coOwnerId);
    }, shopListId);
}


app.listen(3020);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);


loadSession = function(context, callBack, groupId) {
    var connectId = unescape(context.user.cookie['connect.sid']);
    var clientId = context.user.clientId;
    sessionStore.load(connectId, function(err, res) {
        if (groupId == null) {
            group = now.getGroup(res.auth.google.user.id);
        } else {
            group = now.getGroup(groupId);
        }
        group.hasClient(connectId, function (bool) {
            if (!bool) {
                group.addUser(clientId);
            }
        });
        callBack(res.auth, group.now);
    });
}