const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/animals', require('./routes/animalRoutes'));
app.use('/api/scan', require('./routes/scanRoutes'));
app.use('/api/reminders', require('./routes/reminderRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/financial', require('./routes/financialRoutes'));
// app.use('/api/vet', require('./routes/vetRoutes'));

// Scheduled notification jobs (reminders, low stock, weekly summary).
// An external scheduler (e.g. cron-job.org) can trigger them with:
//   POST /api/jobs/run   header: x-cron-secret: <CRON_SECRET>
// This is the reliable option on hosts that put the server to sleep when idle.
const { runAllJobs } = require('./services/notificationJobs');

app.post('/api/jobs/run', async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers['x-cron-secret'] !== secret) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  const result = await runAllJobs();
  res.json({ success: true, result });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server running', timestamp: new Date() });
});

// Error handling
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;
// Also run the jobs from inside the server every 15 minutes while it is awake
if (process.env.DISABLE_INTERNAL_CRON !== 'true') {
  const cron = require('node-cron');
  cron.schedule('*/15 * * * *', () => {
    runAllJobs().catch((err) => console.error('Scheduled jobs failed:', err));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📱 Local: http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});