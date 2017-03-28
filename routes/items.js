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

// item show edit from
router.get('/:item_id/edit', checkItemOwnership, function(req, res){
  Item.findById(req.params.item_id, function(err, foundItem){
    if(err){
      res.redirectr('back');
    }else{
      res.render('items/edit', {room_id: req.params.id, item: foundItem});
    }
  });
});

// item update
router.put('/:item_id', checkItemOwnership, function(req, res){
  Item.findByIdAndUpdate(req.params.item_id, req.body.item, function(err, updatedItem){
    if(err){
      res.redirect('back');
    }else{
      res.redirect('/rooms/' + req.params.id);
    }
  })
});

// item destroy
router.delete('/:item_id', checkItemOwnership,  function(req, res){
  Item.findByIdAndRemove(req.params.item_id, function(err){
    if(err){
        res.redirect('back');
    }else{
        res.redirect('/rooms/' + req.params.id);;
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

function checkItemOwnership(req, res, next){
  if(req.isAuthenticated()){
    Item.findById(req.params.item_id, function(err, foundItem){
      if(err){
        res.redirect('back');
      } else {
        //does user own the item?
        if(foundItem.owner.id.equals(req.user._id)){
          next();
        } else {
          res.redirect('back');
      }
    }
  });
  }else{
    res.redirect('back');
  }
};


module.exports = router;
