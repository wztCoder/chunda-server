const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
require('dotenv').config();
require('./config/db');  // 引入数据库配置
const User = require('./models/user');
// Create Koa app instance
const app = new Koa();
const router = new Router();
// 获取所有客户余额
router.get('/api/users/balances', async ctx => {
  try {
    // 1. 获取所有唯一客户
    const uniqueCustomers = await User.distinct('phoneNumber');

    // 2. 对每个客户计算余额
    const balances = await Promise.all(uniqueCustomers.map(async phoneNumber => {
      const records = await User.find({ phoneNumber });

      // 计算充值总额和消费总额
      const totals = records.reduce((acc, record) => {
        if (record.type === '充值') {
          acc.recharge += record.amount;
        } else if (record.type === '消费') {
          acc.consumption += record.amount;
        }
        return acc;
      }, { recharge: 0, consumption: 0 });

      // 返回客户信息和余额
      return {
        customerName: records[0].customerName,
        phoneNumber: phoneNumber,
        totalRecharge: totals.recharge,
        totalConsumption: totals.consumption,
        balance: totals.recharge - totals.consumption
      };
    }));

    ctx.body = balances;
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      message: '查询失败',
      error: error.message
    };
  }
});
// 根据手机号查询客户交易记录
router.get('/api/users/transactions/:phoneNumber', async ctx => {
  try {
    const records = await User.find({
      phoneNumber: ctx.params.phoneNumber
    }).sort({ createTime: -1 }); // 按时间倒序排列

    if (records.length === 0) {
      ctx.status = 404;
      ctx.body = {
        message: '未找到该客户的交易记录'
      };
      return;
    }

    const totals = records.reduce((acc, record) => {
      if (record.type === '充值') {
        acc.recharge += record.amount;
      } else if (record.type === '消费') {
        acc.consumption += record.amount;
      }
      return acc;
    }, { recharge: 0, consumption: 0 });

    ctx.body = {
      customerInfo: {
        customerName: records[0].customerName,
        phoneNumber: records[0].phoneNumber,
        totalRecharge: totals.recharge,
        totalConsumption: totals.consumption,
        balance: totals.recharge - totals.consumption
      },
      transactions: records.map(record => ({
        type: record.type,
        amount: record.amount,
        createTime: record.createTime
      }))
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      message: '查询失败',
      error: error.message
    };
  }
});
// 添加用户
router.post('/api/users', async ctx => {
  try {
    const user = new User(ctx.request.body);
    console.log('user', user);

    ctx.body = await user.save();
  } catch (error) {
    ctx.status = 500;
    ctx.body = error;
  }
});
// 获取所有用户
router.get('/api/users', async ctx => {
  try {
    ctx.body = await User.find();
  } catch (error) {
    ctx.status = 500;
    ctx.body = error;
  }
});
// 根据id获取记录
router.get('/api/users/:id', async ctx => {
  try {
    const user = await User.findById(ctx.params.id);
    if (!user) {
      ctx.status = 404;
      ctx.body = { message: '用户未找到' };
      return;
    }
    ctx.body = user;
  } catch (error) {
    ctx.status = 500;
    ctx.body = error;
  }
});
// 根据id del 记录
router.delete('/api/users/:id', async ctx => {
  try {
    const user = await User.findByIdAndDelete(ctx.params.id);
    if (!user) {
      ctx.status = 404;
      ctx.body = { message: '用户未找到' };
      return;
    }
    ctx.body = { message: '用户已删除' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = error;
  }
});
// Apply router middleware
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());
app.use(cors());
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
