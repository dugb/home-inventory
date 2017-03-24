var mongoose = require('mongoose');


// Schema Setup
var roomSchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String,
  owner: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  },
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item"
    }
  ]
});
// Compile Schema into a Model
module.exports = mongoose.model("Room", roomSchema);
