const Shoes = require('../models/shoes');
const Size = require('../models/size');
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
    if (filters.size) {
      // New size filter
      const sizeDocs = await Size.find({ size: filters.size });
      const shoeIds = sizeDocs.map((s) => s.shoeId);
      query.id = { $in: shoeIds };
    }
    const [total, list] = await Promise.all([Shoes.countDocuments(), Shoes.find(query).populate('sizes').sort({ createTime: -1 }).skip(skip).limit(pageSize)]);
    const totalPage = Math.ceil(total / pageSize);

    return {
      list,
      totalPage,
    };
  },

  getShoesById(id) {
    return Shoes.findOne({ id: Number(id) }).populate('sizes');
  },

  async createShoes(shoesData) {
    const shoes = new Shoes(shoesData);
    const savedShoes = await shoes.save();
    if (shoesData.sizes && shoesData.sizes.length > 0) {
      const sizeDocs = shoesData.sizes.map((size) => ({
        shoeId: savedShoes.id,
        size: size.size,
        stock: size.stock || 0,
      }));
      await Size.insertMany(sizeDocs);
    }

     return Shoes.findById(savedShoes._id).populate('sizes');
  },

  async updateShoes(id, shoesData) {
    // Update shoe info
    const updatedShoes = await Shoes.findOneAndUpdate({ id: Number(id) }, shoesData, { new: true, runValidators: true });

    // Update sizes if provided
    if (shoesData.sizes) {
      await Size.deleteMany({ shoeId: Number(id) });
      const sizeDocs = shoesData.sizes.map((size) => ({
        shoeId: Number(id),
        size: size.size,
        stock: size.stock || 0,
      }));
      await Size.insertMany(sizeDocs);
    }

    return this.getShoesById(id);
  },

  async deleteShoes(id) {
    // Delete sizes first
    await Size.deleteMany({ shoeId: Number(id) });
    // Then delete shoe
    return Shoes.findOneAndDelete({ id: Number(id) });
  },
};

module.exports = shoesService;
