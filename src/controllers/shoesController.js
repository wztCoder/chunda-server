const shoesService = require('../services/shoesService');

const shoesController = {
  async getAllShoes(ctx) {
    try {
      const { page, pageSize, articleNumber, location, size } = ctx.query;
      console.log(articleNumber, location);
      ctx.body = await shoesService.getAllShoes(page, pageSize, { articleNumber, location, size });
    } catch (error) {
      ctx.status = 500;
      ctx.body = { message: '获取失败', error: error.message };
    }
  },

  async getShoesById(ctx) {
    try {
      const shoes = await shoesService.getShoesById(ctx.params.id);
      if (!shoes) {
        ctx.status = 404;
        ctx.body = { message: '未找到该鞋子' };
        return;
      }
      ctx.body = shoes;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { message: '查询失败', error: error.message };
    }
  },

  async createShoes(ctx) {
    try {
      console.log('shoesCreate', ctx.request.body);
      const shoes = await shoesService.createShoes(ctx.request.body);
      ctx.status = 201;
      ctx.body = shoes;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { message: '创建失败', error: error.message };
    }
  },

  async updateShoes(ctx) {
    try {
      const shoes = await shoesService.updateShoes(ctx.params.id, ctx.request.body);
      if (!shoes) {
        ctx.status = 404;
        ctx.body = { message: '未找到该鞋子' };
        return;
      }
      ctx.body = shoes;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { message: '更新失败', error: error.message };
    }
  },

  async deleteShoes(ctx) {
    try {
      const shoes = await shoesService.deleteShoes(ctx.params.id);
      if (!shoes) {
        ctx.status = 404;
        ctx.body = { message: '未找到该鞋子' };
        return;
      }
      ctx.body = { message: '删除成功', deletedShoes: shoes };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { message: '删除失败', error: error.message };
    }
  },
};

module.exports = shoesController;
