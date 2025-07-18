const mongoose = require('mongoose');
const Counter = require('../../models/counter');

const shoesSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    required: function() { return !this.isNew; },
    comment: '鞋子ID'
  },
  articleNumber: {
    type: String,
    required: true,
    comment: '货号'
  },
  location: {
    type: String,
    required: true,
    comment: '位置'
  },
  price: { 
    type: String,
    comment: '价格'
  },
  createTime: { 
    type: Date, 
    default: Date.now,
    comment: '创建时间'
  }
})
shoesSchema.virtual('sizes', {
  ref: 'Size',
  localField: 'id',
  foreignField: 'shoeId',
  justOne: false
});
// 添加前置钩子来自动生成 ID
shoesSchema.pre('save', async function(next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'shoesId' }, // 注意这里使用不同的 _id
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.id = counter.seq;
  }
  next();
});
module.exports = mongoose.model('Shoes', shoesSchema);