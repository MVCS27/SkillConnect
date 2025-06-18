const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users", // ✅ matches the model name you registered
    required: true,
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users", // ✅
    required: true,
  },
  serviceCategory: String,
  status: {
    type: String,
    default: "processing"
  },
  date: String, // e.g. "2024-06-13"
  time: String, // e.g. "09:00"
}, { timestamps: true });

module.exports = mongoose.model("booking", bookingSchema);
