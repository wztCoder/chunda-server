const mongoose = require('mongoose');
const Counter = require('./counter');
const userSchema = new mongoose.Schema({
  customerName: { 
    type: String, 
    required: true,
    comment: '客户名称'
  },
  phoneNumber: {
    type: String,
    required: true,
    comment: '手机号'
  },
  type: {
    type: String,
    required: true,
    enum: ['充值', '消费'],
    default: '消费',
    comment: '客户类型'
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
    comment: '金额'
  },
  createTime: { 
    type: Date, 
    default: Date.now,
    comment: '创建时间' 
  },
  id: {
    type: Number,
    unique: true,
    required: true,
    comment: '客户ID'
  },
});
// 添加前置钩子来自动生成 ID
userSchema.pre('save', async function(next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'userId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.id = counter.seq;
  }
  next();
});
module.exports = mongoose.model('User', userSchema);