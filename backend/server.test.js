const request = require('supertest');
const express = require('express');
const workspaceRoutes = require('./routes/workspaceRoutes');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use('/api', workspaceRoutes);

describe('Backend API Routes', () => {
  beforeAll(async () => {
    // Connect to test database or actual DB
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterAll(async () => {
    // Clean up connections
    await mongoose.connection.close();
  });

  it('GET /api/employees - should return an array of employees', async () => {
    const res = await request(app).get('/api/employees');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it('POST /api/employees - should fail if missing required fields', async () => {
    const res = await request(app).post('/api/employees').send({
      id: "incomplete-user"
      // Missing name, role, etc.
    });
    expect(res.statusCode).toEqual(400); // Mongoose validation error
  });
});