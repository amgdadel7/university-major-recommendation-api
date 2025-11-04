const express = require('express');
const pool = require('../config/database');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();

// ============= Permissions =============

// Get all permissions
router.get('/permissions', authenticate, isAdmin, async (req, res) => {
  try {
    const [permissions] = await pool.execute(
      'SELECT PermissionID as id, Name as name, Description as description, Module as module, Action as action FROM Permissions ORDER BY Module, Action'
    );

    res.json({
      success: true,
      data: permissions || []
    });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get permissions',
      error: error.message
    });
  }
});

// Get permission by ID
router.get('/permissions/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [permissions] = await pool.execute(
      'SELECT PermissionID as id, Name as name, Description as description, Module as module, Action as action FROM Permissions WHERE PermissionID = ?',
      [id]
    );

    if (permissions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }

    res.json({
      success: true,
      data: permissions[0]
    });
  } catch (error) {
    console.error('Get permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get permission',
      error: error.message
    });
  }
});

// Create permission
router.post('/permissions', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, description, module, action } = req.body;

    if (!name || !module || !action) {
      return res.status(400).json({
        success: false,
        message: 'Name, module, and action are required'
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO Permissions (Name, Description, Module, Action) VALUES (?, ?, ?, ?)',
      [name, description || null, module, action]
    );

    res.status(201).json({
      success: true,
      message: 'Permission created successfully',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('Create permission error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Permission already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create permission',
      error: error.message
    });
  }
});

// Update permission
router.put('/permissions/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, module, action } = req.body;

    await pool.execute(
      'UPDATE Permissions SET Name = ?, Description = ?, Module = ?, Action = ? WHERE PermissionID = ?',
      [name, description, module, action, id]
    );

    res.json({
      success: true,
      message: 'Permission updated successfully'
    });
  } catch (error) {
    console.error('Update permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update permission',
      error: error.message
    });
  }
});

// Delete permission
router.delete('/permissions/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute('DELETE FROM Permissions WHERE PermissionID = ?', [id]);

    res.json({
      success: true,
      message: 'Permission deleted successfully'
    });
  } catch (error) {
    console.error('Delete permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete permission',
      error: error.message
    });
  }
});

// ============= Roles =============

// Get all roles
router.get('/roles', authenticate, isAdmin, async (req, res) => {
  try {
    const [roles] = await pool.execute(
      `SELECT r.RoleID as id, r.Name as name, r.Description as description, 
              r.IsCustom as isCustom, r.IsDefault as isDefault, r.CreatedAt,
              GROUP_CONCAT(rp.PermissionID) as permissionIds
       FROM Roles r
       LEFT JOIN RolePermissions rp ON r.RoleID = rp.RoleID
       GROUP BY r.RoleID, r.Name, r.Description, r.IsCustom, r.IsDefault, r.CreatedAt
       ORDER BY r.IsDefault DESC, r.CreatedAt DESC`
    );

    // Format permissions as array
    const formattedRoles = roles.map(role => ({
      ...role,
      permissions: role.permissionIds ? role.permissionIds.split(',').map(id => id.toString()) : []
    }));

    res.json({
      success: true,
      data: formattedRoles
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get roles',
      error: error.message
    });
  }
});

// Get role by ID
router.get('/roles/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [roles] = await pool.execute(
      `SELECT r.RoleID as id, r.Name as name, r.Description as description,
              r.IsCustom as isCustom, r.IsDefault as isDefault, r.CreatedAt,
              GROUP_CONCAT(rp.PermissionID) as permissionIds
       FROM Roles r
       LEFT JOIN RolePermissions rp ON r.RoleID = rp.RoleID
       WHERE r.RoleID = ?
       GROUP BY r.RoleID, r.Name, r.Description, r.IsCustom, r.IsDefault, r.CreatedAt`,
      [id]
    );

    if (roles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    const role = {
      ...roles[0],
      permissions: roles[0].permissionIds ? roles[0].permissionIds.split(',').map(id => id.toString()) : []
    };

    res.json({
      success: true,
      data: role
    });
  } catch (error) {
    console.error('Get role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get role',
      error: error.message
    });
  }
});

// Create role
router.post('/roles', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Role name is required'
      });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Create role
      const [result] = await connection.execute(
        'INSERT INTO Roles (Name, Description, IsCustom) VALUES (?, ?, TRUE)',
        [name, description || null]
      );

      const roleId = result.insertId;

      // Add permissions if provided
      if (permissions && Array.isArray(permissions) && permissions.length > 0) {
        const permissionValues = permissions.map(permId => [roleId, permId]);
        await connection.query(
          'INSERT INTO RolePermissions (RoleID, PermissionID) VALUES ?',
          [permissionValues]
        );
      }

      await connection.commit();
      connection.release();

      res.status(201).json({
        success: true,
        message: 'Role created successfully',
        data: {
          id: roleId
        }
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Create role error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Role name already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create role',
      error: error.message
    });
  }
});

// Update role
router.put('/roles/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    // Check if role is default (cannot modify default roles)
    const [existingRoles] = await pool.execute(
      'SELECT IsDefault FROM Roles WHERE RoleID = ?',
      [id]
    );

    if (existingRoles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    if (existingRoles[0].IsDefault) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify default roles'
      });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update role
      await connection.execute(
        'UPDATE Roles SET Name = ?, Description = ? WHERE RoleID = ?',
        [name, description, id]
      );

      // Update permissions
      // Delete existing permissions
      await connection.execute(
        'DELETE FROM RolePermissions WHERE RoleID = ?',
        [id]
      );

      // Add new permissions
      if (permissions && Array.isArray(permissions) && permissions.length > 0) {
        const permissionValues = permissions.map(permId => [id, permId]);
        await connection.query(
          'INSERT INTO RolePermissions (RoleID, PermissionID) VALUES ?',
          [permissionValues]
        );
      }

      await connection.commit();
      connection.release();

      res.json({
        success: true,
        message: 'Role updated successfully'
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update role',
      error: error.message
    });
  }
});

// Delete role
router.delete('/roles/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if role is default (cannot delete default roles)
    const [existingRoles] = await pool.execute(
      'SELECT IsDefault FROM Roles WHERE RoleID = ?',
      [id]
    );

    if (existingRoles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    if (existingRoles[0].IsDefault) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete default roles'
      });
    }

    await pool.execute('DELETE FROM Roles WHERE RoleID = ?', [id]);

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete role',
      error: error.message
    });
  }
});

module.exports = router;

