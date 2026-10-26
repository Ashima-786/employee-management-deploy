const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const workspaceRoutes = require('./routes/workspaceRoutes');

const app = express();

app.use(cors()); 
app.use(express.json()); 

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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});