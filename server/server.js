const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

dotenv.config();

const { connectDB, sequelize } = require('./config/db');
// Import models to register associations before sync
require('./models');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://note-stack-ten.vercel.app',
      process.env.CLIENT_URL
    ].filter(Boolean),
    methods: ['GET', 'POST']
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use('/api/', rateLimit({ windowMs: 10 * 60 * 1000, max: 100 }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

io.on('connection', (socket) => {
  console.log('WebSocket connected');
  socket.on('disconnect', () => console.log('WebSocket disconnected'));
});

app.set('io', io);

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

app.get('/', (req, res) => res.json({ message: 'NOTESTACK API running' }));
app.get('/api', (req, res) => res.json({ message: 'NOTESTACK API running' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message });
});

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced (alter)');
  } catch (error) {
    // Fallback for inconsistent legacy constraints after migration from MongoDB setup.
    if (error.name === 'SequelizeUnknownConstraintError') {
      console.warn('⚠️ Alter sync failed due to missing constraint. Retrying with safe sync...');
      await sequelize.sync();
      console.log('✅ Database synced (safe mode)');
    } else {
      throw error;
    }
  }
  server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} in use. Kill it with: npx kill-port ${PORT}`);
      process.exit(1);
    }
  });
};

start();
