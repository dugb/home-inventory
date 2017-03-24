 var express      = require('express'),
 app              = express(),
 bodyParser       = require('body-parser'),
 mongoose         = require('mongoose'),
 passport         = require('passport'),
 LocalStrategy    = require('passport-local'),
 methodOverride   = require('method-override'),
 User             = require('./models/user'),
 Room             = require('./models/room'),
 Item             = require('./models/item'),
 seedDB           = require('./seeds');

 // requiring routes
var itemRoutes  = require('./routes/items'),
    roomRoutes  = require('./routes/rooms'),
    indexRoutes = require('./routes/index')

 // PASSPORT CONFIGURATION
app.use(require('express-session')({
  secret: "secret password",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session()) ;
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));

 // Connect to mongo DB
 mongoose.connect('mongodb://localhost/home_inventory_5');

//seedDB();

// Room.remove({}, function(err){
//   if(err){
//     console.log(err);
//   } else {
//   console.log('removed rooms');
  // Item.remove({}, function(err){
  //   if(err){
  //     console.log(err);
  //   }else{
  //     console.log('remove items');
  //     }
  //   });
//   }
// });

// User.remove({}, function(err){
//    if(err){
//      console.log(err);
//    }else{
//      console.log('remove users');
//      }
//    });
//
app.use(function (req, res, next){
  res.locals.currentUser = req.user;
  next();
});

app.use('/', indexRoutes);
app.use('/rooms', roomRoutes);
app.use('/rooms/:id/items', itemRoutes);

// Landing
app.get('/', function(req, res){
  res.render('landing');
})

// Start Node Server
 app.listen('3000', function(){
   console.log("Home-Inventory Server started - localhost:3000");
   console.log("ctrl-C to stop");
 });
