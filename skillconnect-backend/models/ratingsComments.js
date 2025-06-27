const mongoose = require("mongoose");

const ratingCommentSchema = new mongoose.Schema({
  providerId: { type: String, ref: "users", required: true },
  customerId: { type: String, ref: "users", required: true },
  userName: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ratingsComments", ratingCommentSchema);