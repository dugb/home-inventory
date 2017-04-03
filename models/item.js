var mongoose = require('mongoose');

//create item Schema
var itemSchema = mongoose.Schema({
  name: String,
  description: String,
  image: [
    {
      urlDefault: String,
      urlMobile: String,
      urlFullSize: String
    }
    ],
  owner: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  }
});

module.exports =  mongoose.model('Item', itemSchema);
