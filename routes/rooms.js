var express = require('express');
var router = express.Router({mergeParams: true});
var Room = require('../models/room');
var Home = require('../models/home');
var middleware = require('../middleware');
var formidable = require('formidable');
var fs = require('fs');
var AWS = require('aws-sdk');
var sharp = require('sharp');
var uuid = require('node-uuid');

//  index of rooms route
router.get('/', middleware.isLoggedIn, function(req,res){
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
router.get('/new', middleware.isLoggedIn, function(req, res){
  res.render('rooms/new.ejs');
});

//CREATE - add new room to DB
router.post('/', middleware.isLoggedIn, function(req, res){

  var form = new formidable.IncomingForm();
  var newRoomName = "";
  var newRoomDesc = "";
  // get data from form
  form.parse(req, function(err, fields, file){
    if(err){
      console.log(err);
    }else{
      newRoomName = fields.name;
      newRoomDesc = fields.description;
    };
  });

  form.on('fileBegin', function (name, file){
    // give unique name
    file.name =  uuid.v4() +"-"+file.name;
    file.path =  'tmp/' + file.name;
    console.log('file path = ' + file.path);
  });

  form.on('file', function (name, file){
    console.log('Main - Uploaded ' + file.name);
    // resize imgage
    imgResize(file.path, 600, function(imgResizedPath){
      console.log('Main - Sized: resizedImg= '+ imgResizedPath);
      fs.unlink(file.path);
      // send to s3
      imgSendtoS3(imgResizedPath, file.name, function(params){
        console.log('Main - sent to s3');
        fs.unlink(imgResizedPath);
        var owner ={
          id: req.user._id,
          username: req.user.username
        };
        var newRoomImages={
          awsBucket: params.Bucket,
          awsKey: params.Key,
          urlDefault: "https://" + params.Bucket + ".s3.amazonaws.com/" + params.Key,
          urlFullSize: "",
          urlMobile: ""
        };
        var newRoom = {name: newRoomName, image: newRoomImages, description: newRoomDesc, owner: owner};
        Room.create(newRoom, function(err, newlyCreated){
          if(err){
            console.log(err);
          }else{
            // add new room to users home
            Home.findOne({"owner.id": req.user._id}, function(err, userHome){
              userHome.rooms.push(newlyCreated);
              userHome.save();
              //redirect back to rooms page
              res.redirect('rooms');
            });
          };
        });
      });
    });
  });
});

// SHOW - shows more info about one room
router.get('/:id', middleware.checkRoomOwnership, function(req, res){
  // find room with provided ID
  Room.findById(req.params.id).populate('items').exec(function(err, foundRoom){
    if(err){
      console.log(err);
    }else{
      Room.find({"owner.id": req.user._id}, function(err, userRooms){
        if(err){
          console.log(err);
        }else{
          // render show template for that room
          res.render('rooms/show', {room: foundRoom, rooms: userRooms});
        }
      });
    }
  });
});

// EDIT ROOM ROUTE
router.get('/:id/edit', middleware.checkRoomOwnership, function(req, res){
  Room.findById(req.params.id, function(err, foundRoom){
      res.render('rooms/edit', {room: foundRoom});
  });
});

// UPDATE ROOM ROUTE
router.put('/:id', middleware.checkRoomOwnership, function(req, res){
  //find and update the room
  Room.findByIdAndUpdate(req.params.id, req.body.room, function(err, updatedRoom){
    if(err){
      res.redirect('/rooms');
    }else{
      res.redirect('/rooms/' + req.params.id);
    }
  });
});

// DESTROY ROOM ROUTE
router.delete('/:id', middleware.checkRoomOwnership, function(req, res){
  // delete photo from s3
  Room.findById(req.params.id, function(err, foundRoom){
    if(err){
      console.log(err);
    }else{
      console.log('DELETE: foundRoom: ' + foundRoom.image.awsBucket + foundRoom.image.awsKey);
      deletePhoto(foundRoom.image.awsBucket, foundRoom.image.awsKey)
    }
  });
  // delete room from DB
  Room.findByIdAndRemove(req.params.id, function(err){
    if(err){
      res.redirect('/rooms');
    }else{
      res.redirect('/rooms');
    }
  });
});

// *** FUNCTIONS ***
//  Resize
imgResize = function(imgPath, size, callback){
  var newFilePath = 'tmp/resizedfile.jpg';
  sharp(imgPath)
    .resize(size)
    .rotate()
    .toFile(newFilePath, function(err) {
      if(err){
        console.log(err);
      }else{
        if(callback  && typeof(callback)=== "function"){
          callback(newFilePath);
        };
      };
    });
};

//  Send resized image to S3
imgSendtoS3 = function(imgPath, imgName, callback){
  var s3 = new AWS.S3();
  // define s3 params
  var params = {
    ACL:    'public-read',
    Bucket: process.env.S3_BUCKET,
    Key:    'uploaded/' + imgName,
    Body:   fs.createReadStream(imgPath)
    };
  // send the file to the s3 bucket
  s3.putObject(params, function(err, data) {
    if (err){
      console.log(err)
    }else{
      if(callback  && typeof(callback)=== "function"){
          callback(params);
      };
    };
  });
};

// Delete from S3
function deletePhoto(bucket, key) {
  var s3 = new AWS.S3();
  s3.deleteObject({Bucket: bucket, Key: key}, function(err, data) {
    if(err){
      console.log('There was an error deleting your photo: ', err.message);
    }else{
      console.log('Successfully deleted photo.');
    }
  });
};

module.exports = router;
