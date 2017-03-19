var mongoose = require('mongoose');
var Room = require('./models/room');
var Item = require('./models/item');

var data = [
  {
    name:   "Kitchen",
    image:  "https://farm5.staticflickr.com/4108/4955204998_d342dd68d9.jpg",
    description: "This is the kitchen, first floor"
  },
  {
    name:   "Master Bedroom",
    image:  "https://farm5.staticflickr.com/4028/4677858954_0cb6964d3b.jpg",
    description: "This is the master bedroom, first floor."
  },
  {
    name:   "Living Room",
    image:  "https://farm4.staticflickr.com/3598/3312117967_1c61babc4b.jpg",
    description: "This is the living room, first floor"
  }
];

function seedDB(){
    // Remove all campgrounds
    Room.remove({}, function(err){
      if(err){
        console.log(err);
      } else {
      console.log('removed rooms');
      Item.remove({}, function(err){
        if(err){
          console.log(err);
        }else{
          console.log('remove items');
      // Add a few campgrounds
      data.forEach(function(seed){
        Room.create(seed, function(err, room){
          if(err){
            console.log(err);
          } else {
            console.log("added a room");
            //create a comment on each campground
            Item.create(
              {
              name: "TV",
              description: "Television",
              image:  ["https://farm9.staticflickr.com/8054/8149383268_65cd18ab6a.jpg", "https://farm4.staticflickr.com/3501/3701994850_48015b940d.jpg"]
            }, function(err, item){
                if(err){
                  console.log(err);
                } else {
                    room.items.push(item);
                    room.save();
                    console.log("Item Created");
                }
              });

              Item.create(
                {
                name: "Computer",
                description: "laptop computer",
                image:  "https://farm6.staticflickr.com/5587/14934460071_1bf0e46ea8.jpg"
              }, function(err, item){
                  if(err){
                    console.log(err);
                  } else {
                      room.items.push(item);
                      room.save();
                      console.log("Item Created");
                  }
                });


          }
        });
      });
      }
    });
    }
  });
};

module.exports = seedDB;
