const userScoreService = require('../services/userScoreService');

const userScoreController = {
  getAllUserScore: async (ctx) => {
    try {
      const { page = 1, pageSize = 10, mobile } = ctx.query;
      const scores = await userScoreService.getAllScores(page, pageSize, mobile);
      ctx.body = scores;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: 'Failed to fetch user scores' };
    }
  },
  getScoreByMobile: async (ctx) => {
    try {
      console.log('ctx',ctx.params.mobile);
      
      const score = await userScoreService.getScoreByMobile(ctx.params.mobile);
      if (!score) {
        ctx.status = 404;
        ctx.body = { error: 'User score not found' };
        return;
      }
      ctx.body = score;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: 'Failed to fetch user score' };
    }
  },
  createUpdateUserScore: async (ctx) => {
    try {
      const score = await userScoreService.createOrUpdateScore(ctx.request.body);
      ctx.body = score;
    } catch (error) {
      ctx.status = 400;
      ctx.body = { error: error.message };
    }
  },

  deleteUserScore: async (ctx) => {
    try {
      const result = await userScoreService.deleteScore(ctx.params.mobile);
      if (!result) {
        ctx.status = 404;
        ctx.body = { error: 'User score not found' };
        return;
      }
      ctx.body = { message: 'User score deleted successfully' };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: 'Failed to delete user score' };
    }
  },
};

module.exports = userScoreController;
