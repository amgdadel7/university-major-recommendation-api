const pool = require('../config/database');

// Log audit trail
const logAudit = async (userId, userName, action, entity, description, ipAddress, userAgent, severity = 'medium') => {
  try {
    await pool.execute(
      `INSERT INTO AuditLogs (UserID, UserName, Action, Entity, Description, IPAddress, UserAgent, Severity, CreatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [userId, userName, action, entity, description, ipAddress, userAgent, severity]
    );
  } catch (error) {
    console.error('Error logging audit:', error);
  }
};

// Middleware to log requests
const auditLogger = (req, res, next) => {
  // Store original json and send functions
  const originalJson = res.json;
  const originalSend = res.send;

  res.json = function (body) {
    // Log after response
    if (req.user && res.statusCode < 500) {
      const action = req.method === 'GET' ? 'view' : 
                     req.method === 'POST' ? 'create' : 
                     req.method === 'PUT' ? 'update' : 
                     req.method === 'PATCH' ? 'update' : 
                     req.method === 'DELETE' ? 'delete' : 'unknown';
      
      const entity = req.path.split('/')[2] || 'unknown';
      const description = `${req.method} ${req.path}`;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent') || '';

      logAudit(
        req.user.id || req.user.userId,
        req.user.name || req.user.userName || 'Unknown',
        action,
        entity,
        description,
        ipAddress,
        userAgent,
        'low'
      );
    }
    return originalJson.call(this, body);
  };

  next();
};

module.exports = { logAudit, auditLogger };

