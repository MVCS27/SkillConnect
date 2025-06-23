const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  customerId: { type: String, ref: "users", required: true },
  providerId: { type: String, ref: "users", required: true },
  serviceCategory: String,
  status: { type: String, default: "processing" },
  date: String,
  time: String,
}, { timestamps: true });

module.exports = mongoose.model("booking", bookingSchema);
