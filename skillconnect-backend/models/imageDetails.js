const mongoose = require("mongoose");

const ImageDetailsSchema = new mongoose.Schema(
    {
        image: String,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" }, // <-- add this
    },
    {
        collection: "images",
    }
);

mongoose.model("images", ImageDetailsSchema);
