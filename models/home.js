var mongoose = require('mongoose');


// Schema Setup
var homeSchema = new mongoose.Schema({
  owner: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  },
  rooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room"
    }
  ]
});
// Compile Schema into a Model
module.exports = mongoose.model("Home", homeSchema);
