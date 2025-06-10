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
}, { timestamps: true });

module.exports = mongoose.model("booking", bookingSchema);
