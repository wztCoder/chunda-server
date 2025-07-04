const mongoose = require('mongoose');
const sizeSchema = new mongoose.Schema({
  shoeId: {
    type: Number,
    ref: 'Shoes',
    required: true,
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
