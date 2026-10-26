const mongoose = require('mongoose');

// Employee Schema
const employeeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  team: { type: String, required: true },
  initials: { type: String, required: true },
  color: { type: String, enum: ["blue", "green", "amber", "rose", "violet"] },
  activeTasks: { type: Number, default: 0 },
  priorityTasks: { type: Number, default: 0 },
  commitments: { type: Number, default: 0 },
  meetings: { type: Number, default: 0 },
  workload: { type: String, enum: ["Balanced", "Elevated", "High"], default: "Balanced" }
}); // <-- Removed { _id: false }

// Project Schema
const projectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  lead: { type: String, required: true },
  health: { type: String, enum: ["Healthy", "At risk", "Blocked", "Completed"] },
  risk: { type: Number, required: true },
  milestone: { type: String, required: true }
}); // <-- Removed { _id: false }

// Commitment Schema
const commitmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  statement: { type: String, required: true },
  ownerId: { type: String, required: true },
  recipient: { type: String, required: true },
  deadline: { type: String, required: true },
  source: { type: String, required: true },
  projectId: { type: String, required: true },
  status: { type: String, enum: ["Upcoming", "At Risk", "Completed", "Overdue"] },
  risk: { type: String, enum: ["Low", "Medium", "High"] },
  taskId: { type: String },
  transcript: { type: String },
  impact: { type: String },
  nextAction: { type: String }
}); // <-- Removed { _id: false }

// Task Schema
const taskSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  ownerId: { type: String, required: true },
  projectId: { type: String, required: true },
  priority: { type: String, enum: ["High", "Medium", "Low"] },
  status: { type: String, enum: ["Healthy", "At risk", "Blocked", "Completed"] },
  due: { type: String, required: true }
}); // <-- Removed { _id: false }

module.exports = {
  Employee: mongoose.model('Employee', employeeSchema),
  Project: mongoose.model('Project', projectSchema),
  Commitment: mongoose.model('Commitment', commitmentSchema),
  Task: mongoose.model('Task', taskSchema)
};