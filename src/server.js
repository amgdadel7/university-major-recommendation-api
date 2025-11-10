const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'University Major Recommendation API Documentation',
  customfavIcon: '/favicon.ico'
}));

// Routes
const authRoutes = require('./routes/auth');
const studentsRoutes = require('./routes/students');
const teachersRoutes = require('./routes/teachers');
const universitiesRoutes = require('./routes/universities');
const majorsRoutes = require('./routes/majors');
const applicationsRoutes = require('./routes/applications');
const surveyRoutes = require('./routes/survey');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');
const reportsRoutes = require('./routes/reports');
const backupRoutes = require('./routes/backup');
const contentRoutes = require('./routes/content');
const calendarRoutes = require('./routes/calendar');
const notificationsRoutes = require('./routes/notifications');
const messagesRoutes = require('./routes/messages');
const interviewsRoutes = require('./routes/interviews');
const semestersRoutes = require('./routes/semesters');
const permissionsRoutes = require('./routes/permissions');
const universityUsersRoutes = require('./routes/university-users');
const schemaRoutes = require('./routes/schema');
const recommendationsRoutes = require('./routes/recommendations');
const aiRoutes = require('./routes/ai');

// API Routes
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/students`, studentsRoutes);
app.use(`/api/${API_VERSION}/teachers`, teachersRoutes);
app.use(`/api/${API_VERSION}/universities`, universitiesRoutes);
app.use(`/api/${API_VERSION}/majors`, majorsRoutes);
app.use(`/api/${API_VERSION}/applications`, applicationsRoutes);
app.use(`/api/${API_VERSION}/survey`, surveyRoutes);
app.use(`/api/${API_VERSION}/dashboard`, dashboardRoutes);
app.use(`/api/${API_VERSION}/admin`, adminRoutes);
app.use(`/api/${API_VERSION}/reports`, reportsRoutes);
app.use(`/api/${API_VERSION}/backup`, backupRoutes);
app.use(`/api/${API_VERSION}/content`, contentRoutes);
app.use(`/api/${API_VERSION}/calendar`, calendarRoutes);
app.use(`/api/${API_VERSION}/notifications`, notificationsRoutes);
app.use(`/api/${API_VERSION}/messages`, messagesRoutes);
app.use(`/api/${API_VERSION}/interviews`, interviewsRoutes);
app.use(`/api/${API_VERSION}/semesters`, semestersRoutes);
app.use(`/api/${API_VERSION}/admin`, permissionsRoutes);
app.use(`/api/${API_VERSION}/university-users`, universityUsersRoutes);
app.use(`/api/${API_VERSION}/schema`, schemaRoutes);
app.use(`/api/${API_VERSION}/recommendations`, recommendationsRoutes);
app.use(`/api/${API_VERSION}/ai`, aiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'University Major Recommendation API',
    version: API_VERSION,
    documentation: '/api-docs',
    endpoints: {
      auth: `/api/${API_VERSION}/auth`,
      students: `/api/${API_VERSION}/students`,
      teachers: `/api/${API_VERSION}/teachers`,
      universities: `/api/${API_VERSION}/universities`,
      majors: `/api/${API_VERSION}/majors`,
      applications: `/api/${API_VERSION}/applications`,
      survey: `/api/${API_VERSION}/survey`,
      dashboard: `/api/${API_VERSION}/dashboard`,
      admin: `/api/${API_VERSION}/admin`,
      swagger: '/api-docs'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 8000;

// Listen on all network interfaces (0.0.0.0) to allow connections from other devices
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Version: ${API_VERSION}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📍 Base URL: http://localhost:${PORT}/api/${API_VERSION}`);
  console.log(`📍 Network URL: http://10.0.0.66:${PORT}/api/${API_VERSION}`);
  console.log(`📖 Swagger Documentation: http://localhost:${PORT}/api-docs`);
});

module.exports = app;

