const UserScore = require('../models/userScore');
const ScoreRecord = require('../models/scoreRecord');
module.exports = {
  getAllScores: async (page, pageSize, mobile) => {
    const query = {};
    if (mobile) {
      query.mobile = new RegExp(mobile, 'i');
    }
    console.log('query',query);
    
    const skip = (page - 1) * pageSize;
    const [total, scoreRecords] = await Promise.all([
      UserScore.countDocuments(query),
      UserScore.find(query)
        .sort({ createTime: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate({
          path: 'scoreRecord',
          select: 'foreignPhone sellingPrice actualPrice availableScore sellTime', // Explicitly select fields
          options: { lean: true },
        })
        .lean(),
    ]);
    const totalPages = Math.ceil(total / pageSize);
    return {
      totalPages,
      scoreRecords,
    };
  },

  getScoreByMobile: async (mobile) => {
    try {
      // Use the same pattern as getAllScores
      const userScore = await UserScore.findOne({ mobile })
        .populate({
          path: 'scoreRecord',
          select: 'foreignPhone sellingPrice actualPrice availableScore sellTime',
        })
        .lean(); // ✅ Convert to plain object after population

      return userScore;
    } catch (error) {
      throw error;
    }
  },

  createOrUpdateScore: async (scoreData) => {
    try {
      // First check if a record exists with this mobile number
      const existingScore = await UserScore.findOne({ mobile: scoreData.mobile });
      // 2. 处理子表(ScoreRecord)数据
      if (scoreData.scoreRecords && scoreData.scoreRecords.length > 0) {
        // 先删除该用户现有的所有子表记录
        await ScoreRecord.deleteMany({ foreignPhone: scoreData.mobile });

        // 创建新的子表记录
        const newRecords = scoreData.scoreRecords.map((record) => ({
          ...record,
          foreignPhone: scoreData.mobile, // 确保每条记录都有手机号关联
        }));
        await ScoreRecord.insertMany(newRecords);
      }
      if (existingScore) {
        return await UserScore.findOneAndUpdate(
          { mobile: scoreData.mobile }, // 查询条件
          scoreData, // 更新数据
          {
            new: true, // 返回更新后的文档
            upsert: true, // 如果不存在则创建
            setDefaultsOnInsert: true, // 创建时应用默认值
          }
        );
      }

      // Create new record if mobile doesn't exist
      const score = new UserScore(scoreData);
      return await score.save();
    } catch (error) {
      throw error; // Let controller handle the error
    }
  },

  deleteScore: async (mobile) => {
    await ScoreRecord.deleteMany({ foreignPhone: mobile });
    return await UserScore.findOneAndDelete({ mobile });
  },
};
