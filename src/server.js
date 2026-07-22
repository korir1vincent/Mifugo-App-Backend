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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server running', timestamp: new Date() });
});

// Error handling
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📱 Local: http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});