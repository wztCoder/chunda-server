const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
require('dotenv').config();
require('./config/db'); // 引入数据库配置
const User = require('./models/user');
const shoesRoutes = require('./src/routes/shoes.js')
// Create Koa app instance
const app = new Koa();
const router = new Router();
// 获取所有客户余额
router.get('/api/users/balances', async (ctx) => {
  try {
    console.log('Fetching all user balances...');
    // Get pagination parameters from query
    const page = parseInt(ctx.query.page) || 1;
    const pageSize = parseInt(ctx.query.pageSize) || 10;
    console.log(`Fetching user balances - Page: ${page}, PageSize: ${pageSize}`);
    const skip = (page - 1) * pageSize;
    const { customerName, phoneNumber } = ctx.query;
    console.log(`Filters - Customer Name: ${customerName}, Phone Number: ${phoneNumber}`);
    let query = {};
    if (phoneNumber) {
      query.phoneNumber = new RegExp(phoneNumber, 'i'); // case insensitive search
    }
    if (customerName) {
      query.customerName = new RegExp(customerName, 'i');
    }
    // 1. 获取所有唯一客户
    const uniqueCustomers = await User.distinct('phoneNumber', query);
    const total = uniqueCustomers.length;
    const paginatedCustomers = uniqueCustomers.slice(skip, skip + pageSize);
    // 2. 对每个客户计算余额
    const balances = await Promise.all(
      paginatedCustomers.map(async (phoneNumber) => {
        const records = await User.find({ phoneNumber });

        // 计算充值总额和消费总额
        const totals = records.reduce(
          (acc, record) => {
            if (record.type === '充值') {
              acc.recharge += record.amount;
            } else if (record.type === '消费') {
              acc.consumption += record.amount;
            }
            return acc;
          },
          { recharge: 0, consumption: 0 }
        );

        // 返回客户信息和余额
        return {
          customerName: records[0].customerName,
          phoneNumber: phoneNumber,
          totalRecharge: totals.recharge,
          totalConsumption: totals.consumption,
          balance: totals.recharge - totals.consumption,
        };
      })
    );

    ctx.body = {
      data: balances,
      pagination: {
        current: page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      message: '查询失败',
      error: error.message,
    };
  }
});
// 根据手机号查询客户交易记录
router.get('/api/users/transactions/:phoneNumber', async (ctx) => {
  try {
    console.log(`Fetching transactions for phone number: ${ctx.params.phoneNumber}`);
    const records = await User.find({
      phoneNumber: ctx.params.phoneNumber,
    }).sort({ createTime: -1 }); // 按时间倒序排列

    if (records.length === 0) {
      ctx.status = 404;
      ctx.body = {
        message: '未找到该客户的交易记录',
      };
      return;
    }

    const totals = records.reduce(
      (acc, record) => {
        if (record.type === '充值') {
          acc.recharge += record.amount;
        } else if (record.type === '消费') {
          acc.consumption += record.amount;
        }
        return acc;
      },
      { recharge: 0, consumption: 0 }
    );

    ctx.body = {
      customerInfo: {
        customerName: records[0].customerName,
        phoneNumber: records[0].phoneNumber,
        totalRecharge: totals.recharge,
        totalConsumption: totals.consumption,
        balance: totals.recharge - totals.consumption,
      },
      transactions: records.map((record) => ({
        type: record.type,
        amount: record.amount,
        createTime: record.createTime,
        id: record.id,
      })),
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      message: '查询失败',
      error: error.message,
    };
  }
});
// 添加用户购买消费记录
// 添加或更新用户记录
router.post('/api/users', async (ctx) => {
  try {
    const { id, ...userData } = ctx.request.body;

    if (id) {
      // Update existing user
      console.log(`Updating user with ID: ${id}`);
      const numericId = Number(id);

      // Find and update the user
      const updatedUser = await User.findOneAndUpdate({ id: numericId }, userData, { new: true, runValidators: true });

      if (!updatedUser) {
        ctx.status = 404;
        ctx.body = { message: '用户未找到' };
        return;
      }

      console.log('Update successful:', updatedUser);
      ctx.body = updatedUser;
    } else {
      // Create new user
      console.log('Creating new user');
      const user = new User(userData);
      const savedUser = await user.save();
      console.log('Create successful:', savedUser);

      ctx.status = 201;
      ctx.body = savedUser;
    }
  } catch (error) {
    console.error('Operation failed:', error);
    ctx.status = 500;
    ctx.body = {
      message: id ? '更新用户失败' : '创建用户失败',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  }
});
// 获取所有用户
router.get('/api/users', async (ctx) => {
  try {
    ctx.body = await User.find();
  } catch (error) {
    ctx.status = 500;
    ctx.body = error;
  }
});
// 根据id获取记录
router.get('/api/users/:id', async (ctx) => {
  try {
    console.log(`Fetching user with ID: ${ctx.params.id}`);
    const numericId = Number(ctx.params.id);
    const user = await User.findOne({ id: numericId });
    if (!user) {
      ctx.status = 404;
      ctx.body = { message: '用户未找到' };
      return;
    }

    ctx.body = user;
  } catch (error) {
    console.error('Error fetching user:', error);
    ctx.status = 500;
    ctx.body = {
      message: '查询失败',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  }
});
// 根据id del 记录
router.delete('/api/users/:id', async (ctx) => {
  try {
    // Convert id to number
    const numericId = Number(ctx.params.id);
    if (isNaN(numericId)) {
      ctx.status = 400;
      ctx.body = { message: '无效的ID格式' };
      return;
    }

    // Use findOneAndDelete with the custom id field
    const user = await User.findOneAndDelete({ id: numericId });

    if (!user) {
      ctx.status = 404;
      ctx.body = { message: '用户未找到' };
      return;
    }

    ctx.body = {
      message: '用户已删除',
      deletedUser: user,
    };
  } catch (error) {
    console.error('Delete error:', error);
    ctx.status = 500;
    ctx.body = {
      message: '删除失败',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  }
});
// Apply router middleware
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());
app.use(shoesRoutes.routes());
app.use(shoesRoutes.allowedMethods());
app.use(cors());
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
