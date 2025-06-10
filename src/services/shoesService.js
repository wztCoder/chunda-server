const Shoes = require('../models/shoes');

const shoesService = {
  getAllShoes() {
    return Shoes.find().sort({ createTime: -1 });
  },

  getShoesById(id) {
    return Shoes.findOne({ id: Number(id) });
  },

  createShoes(shoesData) {
    const shoes = new Shoes(shoesData);
    return shoes.save();
  },

  updateShoes(id, shoesData) {
    return Shoes.findOneAndUpdate(
      { id: Number(id) },
      shoesData,
      { new: true, runValidators: true }
    );
  },

  deleteShoes(id) {
    return Shoes.findOneAndDelete({ id: Number(id) });
  }
};

module.exports = shoesService;