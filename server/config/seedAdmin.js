require('dotenv').config();
const { connectDB, sequelize } = require('./db');
const { User } = require('../models');

const seedAdmin = async () => {
  try {
    await connectDB();
    await sequelize.sync({ alter: true });

    const existing = await User.findOne({ where: { email: 'amankarnakarna152@gmail.com' } });
    if (existing) {
      console.log('⚠️  Admin already exists');
      process.exit();
    }

    await User.create({
      name: 'Aman Karn',
      email: 'amankarnakarna152@gmail.com',
      contact: '+91 7204840692',
      password: 'Asha530680@',
      role: 'admin'
    });

    console.log('✅ Admin created');
    console.log('Email    → amankarnakarna152@gmail.com');
    console.log('Password → Asha530680@');
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
