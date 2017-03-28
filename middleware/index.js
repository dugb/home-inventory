var Room = require('../models/room');
var Item = require('../models/item');
var middlewareObj = {};

middlewareObj.checkRoomOwnership = function(req, res, next){
  if(req.isAuthenticated()){
    Room.findById(req.params.id, function(err, foundRoom){
      if(err){
        res.redirect('back');
      } else {
        //does user own the room?
        if(foundRoom.owner.id.equals(req.user._id)){
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

middlewareObj.checkItemOwnership = function(req, res, next){
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

middlewareObj.isLoggedIn = function(req, res, next){
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
};

module.exports=middlewareObj;
