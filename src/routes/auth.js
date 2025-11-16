const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { logAudit } = require('../middleware/logger');
const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: تسجيل مستخدم جديد
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: تم التسجيل بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: بيانات غير صحيحة
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role, age, gender, universityId } = req.body;

    // Normalize gender to match DB ENUM values for Students table
    // DB expects: 'M', 'F', or 'Other'
    let normalizedGender = null;
    if (gender) {
      const genderLower = String(gender).toLowerCase();
      if (genderLower === 'male' || genderLower === 'm') {
        normalizedGender = 'M';
      } else if (genderLower === 'female' || genderLower === 'f') {
        normalizedGender = 'F';
      } else {
        normalizedGender = 'Other';
      }
    }

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Check if email already exists
    const [existingUsers] = await pool.execute(
      'SELECT * FROM Students WHERE Email = ? UNION SELECT * FROM Teachers WHERE Email = ? UNION SELECT * FROM Admins WHERE Email = ? UNION SELECT * FROM UniversityUsers WHERE Email = ?',
      [email, email, email, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    let userId;
    if (role === 'student') {
      const [result] = await pool.execute(
        'INSERT INTO Students (FullName, Email, PasswordHash, Age, Gender, CreatedAt) VALUES (?, ?, ?, ?, ?, NOW())',
        [fullName, email, passwordHash, age || null, normalizedGender]
      );
      userId = result.insertId;
    } else if (role === 'teacher') {
      const [result] = await pool.execute(
        'INSERT INTO Teachers (FullName, Email, PasswordHash, Role, UniversityID, CreatedAt) VALUES (?, ?, ?, ?, ?, NOW())',
        [fullName, email, passwordHash, role, universityId || null]
      );
      userId = result.insertId;
    } else if (role === 'admin') {
      const [result] = await pool.execute(
        'INSERT INTO Admins (FullName, Email, PasswordHash, Role, CreatedAt) VALUES (?, ?, ?, ?, NOW())',
        [fullName, email, passwordHash, role]
      );
      userId = result.insertId;
    } else if (role === 'university') {
      if (!universityId) {
        return res.status(400).json({
          success: false,
          message: 'University ID is required for university users'
        });
      }
      const [result] = await pool.execute(
        'INSERT INTO UniversityUsers (UniversityID, FullName, Email, PasswordHash, Role, IsMainAdmin, IsActive, CreatedAt) VALUES (?, ?, ?, ?, ?, FALSE, TRUE, NOW())',
        [universityId, fullName, email, passwordHash, 'university_staff']
      );
      userId = result.insertId;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, email, role, name: fullName },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Log audit
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || '';
    await logAudit(userId, fullName, 'create', 'user', 'User registration', ipAddress, userAgent, 'low');

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: userId,
          email,
          name: fullName,
          role
        }
      }
    });
  } catch (error) {
    // Log detailed error on server for debugging 500s
    console.error('Error in /api/v1/auth/register:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: تسجيل الدخول (اكتشاف تلقائي للدور)
 *     description: يقوم النظام باكتشاف نوع المستخدم تلقائياً بناءً على البريد الإلكتروني. يسمح بتسجيل الدخول لجميع المستخدمين (طلاب، معلمين، إداريين).
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *           example:
 *             email: user@example.com
 *             password: password123
 *     responses:
 *       200:
 *         description: تم تسجيل الدخول بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: Login successful
 *               data:
 *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   id: 1
 *                   email: user@example.com
 *                   name: أحمد محمد
 *                   role: teacher
 *       401:
 *         description: بيانات اعتماد غير صحيحة
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Login - Smart role detection
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    let user = null;
    let detectedRole = null;
    let tableName = '';

    // Try to find user in all tables (including Students)
    // Check Admins first
    const [admins] = await pool.execute(
      'SELECT AdminID as id, FullName as name, Email, PasswordHash, Role, IsActive, CreatedAt FROM Admins WHERE Email = ?',
      [email]
    );
    if (admins.length > 0) {
      user = admins[0];
      detectedRole = 'admin';
      tableName = 'Admins';
    } else {
      // Check Teachers
      const [teachers] = await pool.execute(
        'SELECT TeacherID as id, FullName as name, Email, PasswordHash, Role, UniversityID, CreatedAt FROM Teachers WHERE Email = ?',
        [email]
      );
      if (teachers.length > 0) {
        user = teachers[0];
        detectedRole = 'teacher';
        tableName = 'Teachers';
      } else {
        // Check UniversityUsers
        const [universityUsers] = await pool.execute(
          'SELECT UserID as id, FullName as name, Email, PasswordHash, Role, UniversityID, IsActive, IsMainAdmin, CreatedAt FROM UniversityUsers WHERE Email = ? AND IsActive = TRUE',
          [email]
        );
        if (universityUsers.length > 0) {
          user = universityUsers[0];
          detectedRole = 'university';
          tableName = 'UniversityUsers';
        } else {
          // Check Students - allow login
          const [students] = await pool.execute(
            'SELECT StudentID as id, FullName as name, Email, PasswordHash, Age, Gender, CreatedAt FROM Students WHERE Email = ?',
            [email]
          );
          if (students.length > 0) {
            user = students[0];
            detectedRole = 'student';
            tableName = 'Students';
          }
        }
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if admin is active
    if (detectedRole === 'admin' && !user.IsActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.PasswordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login for admin, university users, and students
    if (detectedRole === 'admin') {
      await pool.execute(
        'UPDATE Admins SET LastLoginAt = NOW() WHERE AdminID = ?',
        [user.id]
      );
    } else if (detectedRole === 'university') {
      await pool.execute(
        'UPDATE UniversityUsers SET LastLoginAt = NOW() WHERE UserID = ?',
        [user.id]
      );
    } else if (detectedRole === 'student') {
      // Update student last login if there's a LastLoginAt column
      // If not, you can add it to the Students table or skip this
      try {
        await pool.execute(
          'UPDATE Students SET LastLoginAt = NOW() WHERE StudentID = ?',
          [user.id]
        );
      } catch (e) {
        // Column might not exist, ignore error

      }
    }

    // Generate JWT token
    const tokenPayload = {
      id: user.id,
      email: user.Email,
      role: detectedRole,
      name: user.name
    }
    
    // Add UniversityID for university users
    if (detectedRole === 'university' && user.UniversityID) {
      tokenPayload.UniversityID = user.UniversityID
      tokenPayload.universityId = user.UniversityID
    }

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Log audit
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || '';
    await logAudit(user.id, user.name, 'login', 'system', 'User login', ipAddress, userAgent, 'low');

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.Email,
          name: user.name,
          role: detectedRole
        }
      }
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: الحصول على معلومات المستخدم الحالي
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: معلومات المستخدم
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: أحمد محمد
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     role:
 *                       type: string
 *                       example: student
 *       401:
 *         description: غير مصرح
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const { id, role } = req.user;

    let user = null;
    if (role === 'student') {
      const [users] = await pool.execute(
        'SELECT StudentID as id, FullName as name, Email, Age, Gender, CreatedAt FROM Students WHERE StudentID = ?',
        [id]
      );
      user = users[0];
    } else if (role === 'teacher') {
      const [users] = await pool.execute(
        'SELECT TeacherID as id, FullName as name, Email, Role, UniversityID, CreatedAt FROM Teachers WHERE TeacherID = ?',
        [id]
      );
      user = users[0];
    } else if (role === 'university') {
      const [users] = await pool.execute(
        'SELECT UserID as id, FullName as name, Email, Role, UniversityID, Position, IsActive, IsMainAdmin, CreatedAt, LastLoginAt FROM UniversityUsers WHERE UserID = ?',
        [id]
      );
      user = users[0];
    } else if (role === 'admin') {
      const [users] = await pool.execute(
        'SELECT AdminID as id, FullName as name, Email, Role, IsActive, CreatedAt, LastLoginAt FROM Admins WHERE AdminID = ?',
        [id]
      );
      user = users[0];
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/auth/me:
 *   put:
 *     summary: تحديث معلومات المستخدم الحالي
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: أحمد محمد
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               age:
 *                 type: integer
 *                 example: 20
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 example: male
 *     responses:
 *       200:
 *         description: تم التحديث بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: بيانات غير صحيحة
 *       401:
 *         description: غير مصرح
 */
// Update current user profile
router.put('/me', authenticate, async (req, res) => {
  try {
    const { id, role } = req.user;
    const { fullName, email, age, gender } = req.body;

    // Build update fields dynamically
    const updateFields = [];
    const updateValues = [];

    if (fullName !== undefined) {
      updateFields.push('FullName = ?');
      updateValues.push(fullName);
    }

    if (email !== undefined) {
      // Check if email already exists (excluding current user)
      let checkQuery = '';
      if (role === 'student') {
        checkQuery = 'SELECT StudentID FROM Students WHERE Email = ? AND StudentID != ?';
      } else if (role === 'teacher') {
        checkQuery = 'SELECT TeacherID FROM Teachers WHERE Email = ? AND TeacherID != ?';
      } else if (role === 'university') {
        checkQuery = 'SELECT UserID FROM UniversityUsers WHERE Email = ? AND UserID != ?';
      } else if (role === 'admin') {
        checkQuery = 'SELECT AdminID FROM Admins WHERE Email = ? AND AdminID != ?';
      }

      if (checkQuery) {
        const [existing] = await pool.execute(checkQuery, [email, id]);
        if (existing.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Email already exists'
          });
        }
      }

      updateFields.push('Email = ?');
      updateValues.push(email);
    }

    if (age !== undefined && (role === 'student' || role === 'teacher')) {
      updateFields.push('Age = ?');
      updateValues.push(age);
    }

    if (gender !== undefined && (role === 'student' || role === 'teacher')) {
      updateFields.push('Gender = ?');
      updateValues.push(gender);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    // Determine table name based on role
    let tableName = '';
    let idColumn = '';
    if (role === 'student') {
      tableName = 'Students';
      idColumn = 'StudentID';
    } else if (role === 'teacher') {
      tableName = 'Teachers';
      idColumn = 'TeacherID';
    } else if (role === 'university') {
      tableName = 'UniversityUsers';
      idColumn = 'UserID';
    } else if (role === 'admin') {
      tableName = 'Admins';
      idColumn = 'AdminID';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    // Build and execute update query
    updateValues.push(id);
    const updateQuery = `UPDATE ${tableName} SET ${updateFields.join(', ')} WHERE ${idColumn} = ?`;
    
    await pool.execute(updateQuery, updateValues);

    // Fetch updated user data
    let user = null;
    if (role === 'student') {
      const [users] = await pool.execute(
        'SELECT StudentID as id, FullName as name, Email, Age, Gender, CreatedAt FROM Students WHERE StudentID = ?',
        [id]
      );
      user = users[0];
    } else if (role === 'teacher') {
      const [users] = await pool.execute(
        'SELECT TeacherID as id, FullName as name, Email, Role, UniversityID, CreatedAt FROM Teachers WHERE TeacherID = ?',
        [id]
      );
      user = users[0];
    } else if (role === 'university') {
      const [users] = await pool.execute(
        'SELECT UserID as id, FullName as name, Email, Role, UniversityID, Position, IsActive, IsMainAdmin, CreatedAt, LastLoginAt FROM UniversityUsers WHERE UserID = ?',
        [id]
      );
      user = users[0];
    } else if (role === 'admin') {
      const [users] = await pool.execute(
        'SELECT AdminID as id, FullName as name, Email, Role, IsActive, CreatedAt, LastLoginAt FROM Admins WHERE AdminID = ?',
        [id]
      );
      user = users[0];
    }

    // Log audit
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || '';
    await logAudit(id, user?.name || 'Unknown', 'update', 'user', 'Profile updated', ipAddress, userAgent, 'low');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

module.exports = router;

