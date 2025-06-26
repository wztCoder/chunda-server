const Shoes = require('../models/shoes');

const shoesService = {
  async getAllShoes(page = 1, pageSize = 10, filters = {}) {
    const skip = (page - 1) * pageSize;
    const query = {};

    if (filters.articleNumber) {
      query.articleNumber = new RegExp(filters.articleNumber, 'i'); // 支持模糊查询
    }
    if (filters.location) {
      query.location = new RegExp(filters.location, 'i');
    }
    const [total, list] = await Promise.all([
      Shoes.countDocuments(),
      Shoes.find(query).sort({ createTime: -1 }).skip(skip).limit(pageSize)
    ]);
    const totalPage = Math.ceil(total / pageSize);
    
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
