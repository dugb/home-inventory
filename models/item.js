var mongoose = require('mongoose');

//create item Schema
var itemSchema = mongoose.Schema({
  name: String,
  description: String,
  image: [String]
});

module.exports =  mongoose.model('Item', itemSchema);
