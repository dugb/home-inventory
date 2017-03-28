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

// .env
require('dotenv').config();

 // requiring routes
var itemRoutes  = require('./routes/items'),
    roomRoutes  = require('./routes/rooms'),
    indexRoutes = require('./routes/index')

 // PASSPORT CONFIGURATION
app.use(require('express-session')({
  secret:  process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session()) ;
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app setup
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(function (req, res, next){
  res.locals.currentUser = req.user;
  next();
});

 // Connect to mongo DB
 mongoose.connect(process.env.DB_PATH);

// Routes
app.use('/', indexRoutes);
app.use('/rooms', roomRoutes);
app.use('/rooms/:id/items', itemRoutes);
// Landing
app.get('/', function(req, res){
  res.render('landing');
})

// Start Node Server
 app.listen(process.env.SERVER_PORT, function(){
   console.log("Home-Inventory Server started - localhost:3000");
   console.log("ctrl-C to stop");
 });
