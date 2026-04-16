require('dotenv').config();
const { connectDB } = require('./db');
const { User } = require('../models');

const seedUsers = async () => {
  try {
    await connectDB();

    const users = [
      {
        name: 'Aman Karn',
        email: 'amankarn.2024cse@sece.ac.in',
        contact: '9876543210',
        password: 'Asha530680@',
        role: 'admin'
      },
      {
        name: 'Ravi Kumar',
        email: 'ravi.2024cse@sece.ac.in',
        contact: '9876543211',
        password: 'Ravi@1234',
        role: 'student'
      },
      {
        name: 'Priya Sharma',
        email: 'priya.2024cse@sece.ac.in',
        contact: '9876543212',
        password: 'Priya@1234',
        role: 'student'
      }
    ];

    for (const userData of users) {
      const existing = await User.findOne({ where: { email: userData.email } });
      if (existing) {
        console.log(`⚠️  Already exists: ${userData.email}`);
        continue;
      }
      await User.create(userData);
      console.log(`✅ Created [${userData.role}]: ${userData.email}`);
    }

    console.log('\n📋 Login Credentials:');
    console.log('Admin  → amankarn.2024cse@sece.ac.in  / Asha530680@');
    console.log('User 1 → ravi.2024cse@sece.ac.in      / Ravi@1234');
    console.log('User 2 → priya.2024cse@sece.ac.in     / Priya@1234');

    process.exit();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedUsers();
