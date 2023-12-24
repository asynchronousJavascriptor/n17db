var express = require("express");
var router = express.Router();
const userModel = require("./users");
const passport = require("passport");

const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

router.get("/khaalikaro", async function (req, res, next) {
  await userModel.deleteMany({});
  res.redirect("/");
});

router.get("/", async function (req, res, next) {
  const users = await userModel.find();
  res.render("index", {users});
});

router.get("/profile", isLoggedIn, async function (req, res, next) {
  const users = await userModel.find();
  res.render("profile", {users, loggedinuser: req.session.passport.user});
});

router.get("/like/:id", async function (req, res, next) {
  const likeHoneWaalaUser = await userModel.findOne({_id: req.params.id});
  const likeKarneWaalaUser = await userModel.findOne({username: req.session.passport.user});

  if(likeHoneWaalaUser.likes.indexOf(likeKarneWaalaUser.username) === -1){
    likeHoneWaalaUser.likes.push(likeKarneWaalaUser.username);
  }
  else{
    likeHoneWaalaUser.likes.splice(likeHoneWaalaUser.likes.indexOf(likeKarneWaalaUser.username), 1);
  }
  
  await likeHoneWaalaUser.save();
  res.redirect("/profile");
});

router.get("/delete/:id", async function (req, res, next) {
  const deleted = await userModel.findOneAndDelete({_id: req.params.id});
  res.redirect("/");
});

router.get("/update/:id", async function (req, res, next) {
  const user = await userModel.findOne({_id: req.params.id});
  res.render("update", {user});
});

router.post("/update/:id", async function (req, res, next) {
  const user = await userModel.findOneAndUpdate({_id: req.params.id}, {username: req.body.username, age: req.body.age, email: req.body.email});
  res.redirect("/");
});

router.post("/register", async function(req, res){
  const data = new userModel({
    username: req.body.username,
    email: req.body.email,
    age: req.body.age
  })

  userModel.register(data, req.body.password)
  .then(function(resgisteredUser){
    passport.authenticate("local")(req, res, function(){
      res.redirect("/profile");
    })
  })
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login"
}), function(req, res){});

router.get("/logout", function(req, res){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/");
}

module.exports = router;
