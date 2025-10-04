const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  userName: String,
  userEmail: String,
  gameTitle: String,
  reviewDescription: String,
  rating: Number,
  publishYear: Number,
  gameCoverImage: String,
  genre: String,
});

module.exports = mongoose.model("Review", reviewSchema);
