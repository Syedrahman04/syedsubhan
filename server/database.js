const mongoose = require('mongoose');
function DbConnect() {
    const DB_URL = process.env.DB_URL;
    // Database connection
    mongoose.connect("mongodb://0.0.0.0:27017/codershouse", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
        console.log('DB connected...');
    });
}

module.exports = DbConnect;
