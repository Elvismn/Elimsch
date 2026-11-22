// Optional: use this if you prefer to import connect() rather than inline in index.js
const mongoose = require('mongoose');

const connect = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');
};

module.exports = { connect };