const mongoose = require("mongoose");

const ImageDetailsSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true }, // string _id as primary key
        image: String,
        userId: { type: String, ref: "users" }, // string _id
    },
    {
        collection: "images",
    }
);

mongoose.model("images", ImageDetailsSchema);
