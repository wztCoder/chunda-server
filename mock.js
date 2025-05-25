const mongoose = require('mongoose');
const User = require('./models/user');
const customers = ['张三', '李四', '王五', '赵六'];
// 生成随机金额
function getRandomAmount(min = 100, max = 5000) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
const mockData = customers.reduce((acc, customerName, index) => {
    const phoneNumber = `1380013800${index + 1}`;
    // 为每个客户生成3条充值记录和2条消费记录
    const records = [
        // 充值记录
        {
            customerName,
            phoneNumber,
            type: '充值',
            amount: getRandomAmount(1000, 5000)
        },
        {
            customerName,
            phoneNumber,
            type: '充值',
            amount: getRandomAmount(1000, 5000)
        },
        {
            customerName,
            phoneNumber,
            type: '充值',
            amount: getRandomAmount(1000, 5000)
        },
        // 消费记录
        {
            customerName,
            phoneNumber,
            type: '消费',
            amount: getRandomAmount(100, 2000)
        },
        {
            customerName,
            phoneNumber,
            type: '消费',
            amount: getRandomAmount(100, 2000)
        }
    ];
    return [...acc, ...records];
}, []);

async function clearCollection() {
    let connection;
    try {
        connection = await mongoose.connect('mongodb://127.0.0.1:27017/chunda');
        await User.collection.drop();
        console.log('Collection cleared successfully');
    } catch (error) {
        if (error.code !== 26) { // Error code 26 means collection doesn't exist, which is fine
            console.error('Error clearing collection:', error);
        }
    } finally {
        if (connection) {
            await mongoose.disconnect();
        }
    }
}

async function createMockData() {
    const API_URL = 'http://localhost:4003/users';

    // First clear the collection
    await clearCollection();
    // Add some delay to ensure connection is properly closed
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Then create new mock data
    for (const data of mockData) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            console.log(`Created user: ${data.customerName}`, result);
        } catch (error) {
            console.error(`Error creating user ${data.customerName}:`, error);
        }
    }
}

// 运行mock数据创建
createMockData().then(() => {
    console.log('Mock data creation completed');
    process.exit(0);
}).catch(error => {
    console.error('Mock data creation failed:', error);
    process.exit(1);
});