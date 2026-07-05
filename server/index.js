require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const { sequelize } = require('./models');
const errorHandler = require('./middleware/errorHandler');
const { startNotificationCron } = require('./services/notificationService');

const authRoutes = require('./routes/auth');
const moduleRoutes = require('./routes/modules');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/users');
const searchRoutes = require('./routes/search');
const notificationRoutes = require('./routes/notifications');
const reportRoutes = require('./routes/reports');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

const uploadsDir = path.join(__dirname, 'uploads');
const backupsDir = path.join(__dirname, 'backups');
[uploadsDir, backupsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'FarmFlo API' }));

app.use('/api/auth', authRoutes);
app.use('/api', moduleRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api', adminRoutes);

app.use(errorHandler);

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    startNotificationCron();
    app.listen(PORT, () => console.log(`FarmFlo API running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();

module.exports = app;
