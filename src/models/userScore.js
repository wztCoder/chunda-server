const mongoose = require('mongoose');
const Counter = require('../../models/counter');
const userScoreSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    required: function() { return !this.isNew; }
  },
  mobile: {
    type: String,
    unique: true,
    required: true
  },

});
userScoreSchema.virtual('scoreRecord', {
  ref: 'scoreRecord',
  localField: 'mobile',
  foreignField: 'foreignPhone',
  justOne: false
});
// 添加前置钩子来自动生成 ID
userScoreSchema.pre('save', async function(next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'mobileSore' }, // 注意这里使用不同的 _id
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.id = counter.seq;
  }
  next();
});
module.exports = mongoose.model('userScore', userScoreSchema);
