const mongoose = require("mongoose");

const ImageDetailsSchema = new mongoose.Schema(
    {
        image: String
    },
    {
        collection: "images",
    }
);

mongoose.model("images", ImageDetailsSchema);
