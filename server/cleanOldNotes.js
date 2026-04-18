require('dotenv').config();
const mongoose = require('mongoose');
const Note = require('./models/Note');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const result = await Note.deleteMany({ fileUrl: { $regex: '^/uploads/' } });
  console.log('Deleted:', result.deletedCount, 'old notes');
  mongoose.disconnect();
}).catch(e => console.log('Error:', e.message));
