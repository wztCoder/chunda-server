const mongoose = require('mongoose');
const sizeSchema = new mongoose.Schema({
  shoeId: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
  },
  size: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    default: 0,
  },
});
module.exports = mongoose.model('Size', sizeSchema);
