const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    title: String,
    category: String,
    description: String,
    images: [String],
});


module.exports = mongoose.model("Product", ProductSchema);
