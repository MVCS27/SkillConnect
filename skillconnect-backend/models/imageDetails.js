const mongoose = require("mongoose");

const imageDetailsSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true }, // <-- Add this line!
        image: String,
        userId: String,
        type: { type: String, default: "gallery" }, // "profile" or "gallery"
    },
    {
        collection: "images",
    }
);

mongoose.model("images", imageDetailsSchema);
