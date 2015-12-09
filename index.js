// modules
var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var passport = require("passport");
var flash = require("connect-flash");
var session = require("express-session");
//loads module containing all users controller actions.
var topicsController = require("./controllers/topicsController");
var usersController = require("./controllers/usersController");
var UserModel = require("./models/user");
//Twitter
// var router = express.Router();

//may need to rename this database!!!
mongoose.connect("mongodb://localhost/users");
var app = express();
//handlebars for view
app.set("view engine", "hbs");
app.set('src', './templates');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(__dirname + '/public'));
app.use(session({ secret: 'PROJECT-3' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require("./config/passport")(passport);

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

app.get("/login", usersController.getLogin);
app.post("/login", usersController.postLogin);
app.get("/signup", usersController.getSignup);
app.post("/signup", usersController.postSignup);
app.get("/logout", usersController.getLogout);
app.get("/topics", topicsController.index);
app.get('/topics/new', topicsController.new );
app.post('/topics', topicsController.create);

//TWITTER
function authenticatedUser(req, res, next){
  if (req.isAuthenticated()) return next();

  res.redirect("/topics");
}
// // passport.authenticate('twitter') is all we need to trigger that redirect to Twitter.
app.get('/auth/twitter',passport.authenticate('twitter'));


app.get('/auth/twitter/callback',passport.authenticate('twitter', {
  successRedirect: '/topics',
  failureRedirect: '/login'
}));

app.listen(3000, function() {
  console.log("Got this blicky up and running!");
});
