const client = require('prom-client');

// Create a Registry which registers the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'employee-management-backend'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Custom Application & Business Metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5]
});

const totalHttpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests processed',
  labelNames: ['method', 'route', 'status_code']
});

const activeEmployeesGauge = new client.Gauge({
  name: 'workspace_employees_total',
  help: 'Total number of active employees in the system'
});

const employeeOperationsCounter = new client.Counter({
  name: 'workspace_employee_operations_total',
  help: 'Total number of employee CRUD operations performed',
  labelNames: ['operation', 'status']
});

register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(totalHttpRequests);
register.registerMetric(activeEmployeesGauge);
register.registerMetric(employeeOperationsCounter);

// Middleware to track request timing and counts
const metricsMiddleware = (req, res, next) => {
  const start = process.hrtime();
  res.on('finish', () => {
    const duration = process.hrtime(start);
    const durationInSeconds = duration[0] + duration[1] / 1e9;
    const route = req.baseUrl + (req.route?.path || req.path);
    
    totalHttpRequests.inc({
      method: req.method,
      route,
      status_code: res.statusCode
    });

    httpRequestDurationMicroseconds.observe(
      {
        method: req.method,
        route,
        status_code: res.statusCode
      },
      durationInSeconds
    );
  });
  next();
};

module.exports = {
  register,
  metricsMiddleware,
  activeEmployeesGauge,
  employeeOperationsCounter
};
