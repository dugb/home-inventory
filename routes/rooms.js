var express = require('express');
var router = express.Router({mergeParams: true});
var Room = require('../models/room');
var Home = require('../models/home');

//  index of rooms route
router.get('/', isLoggedIn, function(req,res){
  //get current users Home
//   Home.findOne({'owner.id': req.user._id}, function(err, foundHome){
//     if(err){
//       console.log(err);
//     } else {
//       res.render('rooms', {rooms:foundHome.rooms});
//     }
//   });
// });

  // get current users rooms from DB
  Room.find({"owner.id": req.user._id}, function(err, userRooms){
    if(err){
      console.log(err);
    } else {
      res.render('rooms',{rooms:userRooms});
    }
  });
});

//create new room route
router.get('/new', isLoggedIn, function(req, res){
  res.render('rooms/new.ejs');
});

//CREATE - add new room to DB
router.post('/', isLoggedIn, function(req, res){
  // get data from form and add to room
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var owner ={
    id: req.user._id,
    username: req.user.username
  };
  var newRoom = {name: name, image: image, description: desc, owner: owner};
  console.log(req.user._id);
  // Create a new room and save to DB
  Room.create(newRoom, function(err, newlyCreated){
    if(err){
      console.log(err);
    } else {
      // add new room to users home
      Home.findOne({"owner.id": req.user._id}, function(err, userHome){
        userHome.rooms.push(newlyCreated);
        userHome.save();
        //console.log('###USER HOME:  '+ userHome);
        //redirect back to rooms page
        res.redirect('rooms');
      });
    }
  });
});

// SHOW - shows more info about one room
router.get('/:id', function(req, res){
  // find room with provided ID
  Room.findById(req.params.id).populate('items').exec(function(err, foundRoom){
    if(err){
      console.log(err);
    } else {
        Room.find({"owner.id": req.user._id}, function(err, userRooms){
          if(err){
            console.log(err);
          } else {
            // render show template for that room
            res.render('rooms/show', {room: foundRoom, rooms: userRooms});
        }
      });
    }
  });
});

//Middleware
function isLoggedIn(req, res, next){
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
};

module.exports = router;
