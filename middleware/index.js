var Room = require('../models/room');
var Item = require('../models/item');
var middlewareObj = {};

middlewareObj.checkRoomOwnership = function(req, res, next){
  if(req.isAuthenticated()){
    Room.findById(req.params.id, function(err, foundRoom){
      if(err){
        req.flash('errror', "Database error, Room not found.")
        res.redirect('back');
      } else {
        //does user own the room?
        if(foundRoom.owner.id.equals(req.user._id)){
          next();
        } else {
          req.flash('error', "You do not have permission to do that!");
          res.redirect('back');
      }
    }
  });
  }else{
    req.flash('error', "You need to be logged in to do that.");
    res.redirect('back');
  }
};

middlewareObj.checkItemOwnership = function(req, res, next){
  if(req.isAuthenticated()){
    Item.findById(req.params.item_id, function(err, foundItem){
      if(err){
        req.flash('errror', "Database error, Item not found.")
        res.redirect('back');
      } else {
        //does user own the item?
        if(foundItem.owner.id.equals(req.user._id)){
          next();
        } else {
          req.flash('error', "You do not have permission to do that!");
          res.redirect('back');
      }
    }
  });
  }else{
    req.flash('error', "You need to be logged in to do that.");
    res.redirect('back');
  }
};

middlewareObj.isLoggedIn = function(req, res, next){
  if (req.isAuthenticated()){
    return next();
  }
  req.flash('error', "You need to be logged in to do that.");
  res.redirect('/login');
};

module.exports=middlewareObj;
