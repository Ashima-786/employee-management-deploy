const express = require('express');
const router = express.Router();
const { Employee, Project, Commitment, Task } = require('../models/Workspace');
const { activeEmployeesGauge, employeeOperationsCounter } = require('../metrics');

// Helper to refresh active employee count gauge
async function updateEmployeeMetrics() {
  try {
    const count = await Employee.countDocuments();
    activeEmployeesGauge.set(count);
  } catch (err) {
    // Ignore metric collection error during DB disconnects
  }
}

// GET all employees
router.get('/employees', async (req, res) => {
  try {
    const employees = await Employee.find();
    activeEmployeesGauge.set(employees.length);
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all projects
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE a new employee (Required for Infoziant DevOps CRUD)
router.post('/employees', async (req, res) => {
  try {
    const newEmployee = new Employee(req.body);
    const savedEmployee = await newEmployee.save();
    employeeOperationsCounter.inc({ operation: 'create', status: 'success' });
    await updateEmployeeMetrics();
    res.status(201).json(savedEmployee);
  } catch (error) {
    employeeOperationsCounter.inc({ operation: 'create', status: 'failure' });
    res.status(400).json({ message: error.message });
  }
});

// DELETE an employee (Required for Infoziant DevOps CRUD)
router.delete('/employees/:id', async (req, res) => {
  try {
    const result = await Employee.findOneAndDelete({ id: req.params.id });
    if (result) {
      employeeOperationsCounter.inc({ operation: 'delete', status: 'success' });
      await updateEmployeeMetrics();
      res.status(200).json({ message: 'Employee deleted successfully' });
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    employeeOperationsCounter.inc({ operation: 'delete', status: 'failure' });
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;