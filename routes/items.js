var express = require('express');
var router = express.Router({mergeParams: true});
var Room = require('../models/room');
var Item = require('../models/item');
var middleware = require('../middleware');

// Items New
router.get('/new', middleware.isLoggedIn, function(req, res){
  Room.findById(req.params.id, function(err, room){
    if(err){
      console.log(err);
    } else {
      res.render('items/new', {room: room});
    }
  });
});

// Items Create
router.post('/', middleware.isLoggedIn, function(req, res){
  //lookup room using id
  Room.findById(req.params.id, function(err, room){
    if(err){
      res.redirect("/rooms");
    }else{
      //create new item
      Item.create(req.body.item, function(err, item){
        if(err){
          req.flash('error', "Something went wrong!");

          console.log(err);
        }else{
          // add username and id to item
          item.owner.id = req.user.id;
          item.owner.username = req.user.username;
          // save item
          item.save();
          room.items.push(item);
          room.save();
          req.flash('success', "Successfully added you new item!");
          res.redirect('/rooms/' + room._id);
        }
      });
    }
  });
});

// item show edit from
router.get('/:item_id/edit', middleware.checkItemOwnership, function(req, res){
  Item.findById(req.params.item_id, function(err, foundItem){
    if(err){
      res.redirectr('back');
    }else{
      res.render('items/edit', {room_id: req.params.id, item: foundItem});
    }
  });
});

// item update
router.put('/:item_id', middleware.checkItemOwnership, function(req, res){
  Item.findByIdAndUpdate(req.params.item_id, req.body.item, function(err, updatedItem){
    if(err){
      res.redirect('back');
    }else{
      res.redirect('/rooms/' + req.params.id);
    }
  })
});

// item destroy
router.delete('/:item_id', middleware.checkItemOwnership,  function(req, res){
  Item.findByIdAndRemove(req.params.item_id, function(err){
    if(err){
        res.redirect('back');
    }else{
      req.flash('success', "Item Deleted!")
        res.redirect('/rooms/' + req.params.id);;
    }
  });
});

module.exports = router;
