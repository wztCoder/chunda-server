const mongoose = require('mongoose');

// 连接到MongoDB，数据库名为 chunda
mongoose.connect('mongodb://127.0.0.1:27017/chunda', {
   serverSelectionTimeoutMS: 5000,
    retryWrites: true
}).then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

module.exports = mongoose;