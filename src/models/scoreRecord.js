const mongoose = require('mongoose');
const socreRecordSchema = new mongoose.Schema({
  foreignPhone: {
    type: Number,
    required: true,
  },
  sellingPrice: {
    type: Number,
    required: true,
  },
  actualPrice: {
    type: Number,
    required: true,
  },
  availableScore: {
    type: Number,
    required: true,
  },
  sellTime:{
    type: Date,
    default: Date.now
  }


});
module.exports = mongoose.model('scoreRecord', socreRecordSchema);
