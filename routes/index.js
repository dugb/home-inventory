var express = require('express');
var router = express.Router();
var passport = require('passport');
var Room = require('../models/room');
var User = require('../models/user');
var Home = require('../models/home');


// show register form
router.get('/register', function(req, res){
  res.render('register');
});

// handle sign up logic
router.post('/register', function(req, res){
  var newUser = new User({username: req.body.username});
  User.register(newUser, req.body.password, function(err, user){
      if(err){
        console.log(err);
        return res.render('register')
      }
      passport.authenticate('local')(req, res, function(){

        // create newUsers home
        var owner ={
          id: req.user._id,
          username: req.user.username
        };
        var newHome = {
          owner: owner,
          rooms: []
        };
        Home.create(newHome, function(err, newlyCreated){
          if(err){
            console.log(err);
          } else {
              console.log('### new home:  ' + newlyCreated);
          }
        });
        //redirect to home(rooms index)
        res.redirect('rooms');
      });
  });
});

// show login form
router.get('/login', function(req, res){
  res.render('login');
});

// handle login logic
router.post('/login', passport.authenticate("local",
  {
    successRedirect: "rooms",
    failureRedirect: "login"
  }), function(req, res){
});

// logout route
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
})

//  USER HOME PAGE - INDEX OF USERS ROOMS
router.get('/home', isLoggedIn, function(req, res){
  Room.find({"owner.id": req.user._id}, function(err, userRooms){
    if(err){
      console.log(err);
    } else {
      res.render('rooms',{rooms:userRooms});
    }
  });
});

// Middleware
function isLoggedIn(req, res, next){
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
};

module.exports = router;
