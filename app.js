 var express = require('express'),
 app = express(),
 bodyParser = require('body-parser'),
 mongoose = require('mongoose'),
 Room  = require('./models/room'),
 Item = require('./models/item'),
 seedDB      = require('./seeds');

 app.use(bodyParser.urlencoded({extended: true}));
 app.set('view engine', 'ejs');
 app.use(express.static(__dirname + '/public'));

 // Connect to mongo DB
 mongoose.connect('mongodb://localhost/home_inventory');

seedDB();

// ROUTES
// Landing
app.get('/', function(req, res){
  res.render('landing');
})

// index of rooms route
app.get('/rooms', function(req,res){
  // Get all rooms from DB
  Room.find({}, function(err, allRooms){
    if(err){
      console.log(err);
    } else {
      res.render('rooms/index',{rooms:allRooms});
    }
  });
});

//create new room route
app.get('/rooms/new', function(req, res){
  res.render('rooms/new.ejs');
});

//CREATE - add new room to DB
app.post('/rooms', function(req, res){
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var newRoom = {name: name, image: image, description: desc};
  // Create a new room and save to DB
  Room.create(newRoom, function(err, newlyCreated){
    if(err){
      console.log(err);
    } else {
      //redirect back to rooms page
      res.redirect('rooms/index');
    }
  });
});

// SHOW - shows more info about one room
app.get('/rooms/:id', function(req, res){
  // find room with provided ID
  Room.findById(req.params.id).populate('items').exec(function(err, foundRoom){
    if(err){
      console.log(err);
    } else {
        Room.find({}, function(err, allRooms){
          if(err){
            console.log(err);
          } else {
            // render show template for that room
            res.render('rooms/show', {room: foundRoom, rooms: allRooms});
        }
      });
    }
  });
});

//=========================================
// ITEM ROUTES
//=========================================
app.get('/rooms/:id/items/new', function(req, res){
  Room.findById(req.params.id, function(err, room){
    if(err){
      console.log(err);
    } else {
      res.render('items/new', {room: room});
    }
  });
});

app.post('/rooms/:id/items', function(req, res){
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
          room.items.push(item);
          console.log(room);
          room.save();
          res.redirect('/rooms/' + room._id);
        }
      });
    }
  });
});

// Start Node Server
 app.listen('3000', function(){
   console.log("Home-Inventory Server started - localhost:3000");
   console.log("ctrl-C to stop");
 });
