var express = require('express');
var router = express.Router({mergeParams: true});
var Room = require('../models/room');
var Item = require('../models/item');

// Items New
router.get('/new', isLoggedIn, function(req, res){
  Room.findById(req.params.id, function(err, room){
    if(err){
      console.log(err);
    } else {
      res.render('items/new', {room: room});
    }
  });
});

// Items Create
router.post('/', isLoggedIn, function(req, res){
  //lookup room using id
  Room.findById(req.params.id, function(err, room){
    if(err){
      console.log(err);
      res.redirect("/rooms");
    }else{
      //create new item
      Item.create(req.body.item, function(err, item){
        if(err){
          console.log(err);
        }else{
          // add username and id to item
          item.owner.id = req.user.id;
          item.owner.username = req.user.username;
          // save item
          item.save();
          room.items.push(item);
          room.save();
          res.redirect('/rooms/' + room._id);
        }
      });
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
