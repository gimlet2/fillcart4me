
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , everyauth = require('everyauth');

everyauth.debug = true;

var usersById = {};
var nextUserId = 0;
var usersByGoogleId = {};

function addUser (source, sourceUser) {
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

everyauth.google
  .appId('198255835595.apps.googleusercontent.com')
  .appSecret('gpAeYLUaZWQxklj3oe4sUPwC')
  .scope('https://www.google.com/m8/feeds/')
  .findOrCreateUser( function (sess, accessToken, extra, googleUser) {
    googleUser.refreshToken = extra.refresh_token;
    googleUser.expiresIn = extra.expires_in;
    return usersByGoogleId[googleUser.id] || (usersByGoogleId[googleUser.id] = addUser('google', googleUser));
  })
  .redirectPath('/');	


var app = module.exports = express.createServer(
	express.cookieParser(),
	express.session({ secret: 'GFTYUrtyfygfT^&**uyhgiugiuyg67fyt' })
	);
	
app.register('html', require('ejs'));

app.configure(function(){
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



app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes




everyauth.helpExpress(app);

app.get('/', routes.index);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
