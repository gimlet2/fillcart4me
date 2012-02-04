/**
 * Module dependencies.
 */

var express = require('express')
        , routes = require('./routes')
        , everyauth = require('everyauth')
        , io = require('socket.io')
        , Session = require('connect').middleware.session.Session
        , parseCookie = require('connect').utils.parseCookie;


// auth config
everyauth.debug = false;

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
        user = usersById[++nextUserId] = {id:nextUserId};
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

// session config

var sessionSecret = 'GFTYUrtyfygfT^&**uyhgiugiuyg67fyt';
var sessionStore = new express.session.MemoryStore; // TODO add RedisStore

// express config

var app = module.exports = express.createServer(
        express.cookieParser(),
        express.session({ secret:sessionSecret, store:sessionStore, key:'express.sid'  })
);
//var everyone = now.initialize(app);

app.register('html', require('ejs'));

app.configure(function () {
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
app.configure('development', function () {
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
    everyauth.google.appId('198255835595-o7t2gcjkqna9qe093rg6462t2l2hlugr.apps.googleusercontent.com')
            .appSecret('0ibrNhrLb5D27bOMzVXH3YFG')
});

app.configure('production', function () {
    app.use(express.errorHandler());
    everyauth.google.appId('198255835595.apps.googleusercontent.com')
            .appSecret('gpAeYLUaZWQxklj3oe4sUPwC').myHostname("http://fillcart4.me")
});

// Routes

everyauth.helpExpress(app);

app.get('/', routes.index);
app.get('/about', routes.about);


//
//everyone.now.addCoOwner = function (shopListId, coOwnerId) {
//    loadSession(this, function (auth, now) {
//        routes.addCoOwner(auth, now, shopListId, coOwnerId);
//    }, shopListId);
//
//}
//
//everyone.now.deleteCoOwner = function (shopListId, coOwnerId) {
//    loadSession(this, function (auth, now) {
//        routes.deleteCoOwner(auth, now, shopListId, coOwnerId);
//    }, shopListId);
//}


app.listen(3020);
var sio = io.listen(app);
sio.set('authorization', function (data, accept) {
    if (data.headers.cookie) {
        data.cookie = parseCookie(data.headers.cookie);
        data.sessionID = data.cookie['express.sid'];
        // save the session store to the data object
        // (as required by the Session constructor)
        data.sessionStore = sessionStore;
        sessionStore.get(data.sessionID, function (err, session) {
            if (err || !session) {
                accept('Error', false);
            } else {
                // create a session object, passing data as request and our
                // just acquired session data
                data.session = new Session(data, session);
                accept(null, true);
            }
        });
    } else {
        return accept('No cookie transmitted.', false);
    }
});


sio.sockets.on('connection', function (socket) {
    if (socket.handshake.session.auth != null) {
        socket.join(socket.handshake.session.auth.google.user.id);
    }

    var refreshShopLists = function (resp) {
        socket.emit("refreshShopLists", {list:resp});
    };
    var refreshShopListsForUser = function (resp, userId) {
        sio.sockets.in(userId).emit("newShopListShared", {list:resp});
    };
    var refreshShopList = function (resp) {
        socket.emit("refreshShopList", {list:resp});
        socket.broadcast.to(resp._doc._id.__id).emit("refreshShopList", {list:resp});
    };

    socket.on('addShopList', function (data) {
        routes.addShopList(socket.handshake.session.auth, refreshShopLists, data.shopListName);
    });
    socket.on('deleteShopList', function (data) {
        routes.deleteShopList(socket.handshake.session.auth, refreshShopLists, data.shopListId);
    });
    socket.on('getShopLists', function () {
        routes.getShopLists(socket.handshake.session.auth, refreshShopLists);
    });
    socket.on('getShopList', function (data) {
        socket.join(data.shopListId);
        routes.getShopList(socket.handshake.session.auth, refreshShopList, refreshShopLists, data.shopListId);
    });
    socket.on('addItem', function (data) {
        routes.addItem(socket.handshake.session.auth, refreshShopList, data.shopListId, data.itemName);
    });
    socket.on('deleteItem', function (data) {
        routes.deleteItem(socket.handshake.session.auth, refreshShopList, data.shopListId, data.itemId);
    });
    socket.on('buyItem', function (data) {
        routes.buyItem(socket.handshake.session.auth, refreshShopList, data.shopListId, data.itemId);
    });
    socket.on('addCoOwner', function (data) {
        routes.addCoOwner(socket.handshake.session.auth, function (resp) {
            refreshShopListsForUser(resp, data.coOwnerId);
        }, data.shopListId, data.coOwnerId);
    });
    socket.on('deleteCoOwner', function (data) {
        routes.deleteCoOwner(socket.handshake.session.auth, function (resp) {
            refreshShopListsForUser(resp, data.coOwnerId);
        }, data.shopListId, data.coOwnerId);
    });

});

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

