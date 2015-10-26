/* express関連*/
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
// var bodyParser = require('body-parser');
var expressSession = require('express-session');
var sessionStore;
/* socket関連*/
var http = require('http').Server(app);
var io = require('socket.io')(http);
/* Auth */
var passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy;
var conf = require('config');

/* app config */
app.use(express.static('public'));
app.use(cookieParser());
// app.use(bodyParser());
app.use(expressSession({
  store: sessionStore,
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new TwitterStrategy({
    consumerKey: COMSUMERKEY,
    consumerSecret: COMSUMERSECRET,
    callbackURL: "http://localhost:3000/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    // User.findOrCreate({ username: username }, function(err, user) {
    //   if (err) { return done(err); }
    //   done(null, user);
    // });
	return process.nextTick(function() {
   		return done(null, profile);
  	});
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.get('/', function(req, res){
  res.sendFile('index.html', { root : __dirname});
});

// 認証のために Twitter へリダイレクトさせます。認証が完了すると、Twitter は
// ユーザーをアプリケーションへとリダイレクトして戻します。
//   /auth/twitter/callback
app.get('/auth/twitter', passport.authenticate('twitter'));

// ユーザーが許可すると、Twitter はユーザーをこの URL にリダイレクトさせます。
// この認証プロセスの最後に、アクセストークンの取得をおこないます。
// この取得が成功すればユーザーはログインしたことになります。取得に失敗したとき
// は、認証が失敗したとみなされます。
app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { successRedirect: '/',
                                     failureRedirect: '/login' }));

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});