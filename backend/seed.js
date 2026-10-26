const mongoose = require('mongoose');
require('dotenv').config();
const { Employee, Project, Commitment, Task } = require('./models/Workspace');

const employees = [
  { id: "alex", name: "Alex Morgan", role: "Product Manager", team: "Product", initials: "AM", color: "blue", activeTasks: 6, priorityTasks: 2, commitments: 2, meetings: 4, workload: "Elevated" },
  { id: "maya", name: "Maya Chen", role: "Engineering Lead", team: "Platform", initials: "MC", color: "violet", activeTasks: 8, priorityTasks: 3, commitments: 2, meetings: 5, workload: "High" },
  { id: "jordan", name: "Jordan Lee", role: "Backend Engineer", team: "Platform", initials: "JL", color: "green", activeTasks: 5, priorityTasks: 2, commitments: 1, meetings: 3, workload: "Elevated" },
  { id: "priya", name: "Priya Nair", role: "UX Designer", team: "Design", initials: "PN", color: "rose", activeTasks: 4, priorityTasks: 1, commitments: 1, meetings: 2, workload: "Balanced" },
  { id: "sam", name: "Sam Rivera", role: "QA Engineer", team: "Quality", initials: "SR", color: "amber", activeTasks: 7, priorityTasks: 2, commitments: 1, meetings: 3, workload: "Elevated" },
];

const projects = [
  { id: "payment", name: "Payment Platform", lead: "Maya Chen", health: "At risk", risk: 78, milestone: "Payments beta · Oct 30" },
  { id: "identity", name: "Identity Refresh", lead: "Alex Morgan", health: "Healthy", risk: 24, milestone: "Release candidate · Nov 06" },
];

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing data to prevent duplicates
    await Employee.deleteMany({});
    await Project.deleteMany({});
    console.log('🧹 Cleared existing database records');

    // Insert new data
    await Employee.insertMany(employees);
    await Project.insertMany(projects);
    console.log('🌱 Successfully seeded Enterprise Workspace data!');

    process.exit();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDB();