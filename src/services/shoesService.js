const Shoes = require('../models/shoes');

const shoesService = {
  async getAllShoes(page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;
    const [total, list] = await Promise.all([
      Shoes.countDocuments(),
      Shoes.find().sort({ createTime: -1 }).skip(skip).limit(pageSize)
    ]);
    const totalPage = Math.ceil(total / pageSize);
    console.log('list',list,'total',totalPage)
    
    return {
      list,
      totalPage
    };
  },

  getShoesById(id) {
    return Shoes.findOne({ id: Number(id) });
  },

  createShoes(shoesData) {
    const shoes = new Shoes(shoesData);
    return shoes.save();
  },

  updateShoes(id, shoesData) {
    return Shoes.findOneAndUpdate({ id: Number(id) }, shoesData, { new: true, runValidators: true });
  },

  deleteShoes(id) {
    return Shoes.findOneAndDelete({ id: Number(id) });
  },
};

module.exports = shoesService;
