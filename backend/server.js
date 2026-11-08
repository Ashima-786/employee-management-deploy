const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const { register, metricsMiddleware } = require('./metrics');
const workspaceRoutes = require('./routes/workspaceRoutes');

const app = express();

app.use(cors()); 
app.use(express.json()); 
app.use(metricsMiddleware);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err.message));

// Register the API routes
app.use('/api', workspaceRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Operational', service: 'Enterprise AI Workspace API' });
});

// Expose Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex.message);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});