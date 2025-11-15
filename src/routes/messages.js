const express = require('express');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Get conversations
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.role;

    // Get conversations where user is participant 1 or 2
    const [conversations] = await pool.execute(
      `SELECT * FROM Conversations 
       WHERE (Participant1ID = ? AND Participant1Type = ?)
       OR (Participant2ID = ? AND Participant2Type = ?)
       ORDER BY LastMessageAt DESC`,
      [userId, userType, userId, userType]
    );

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get conversations',
      error: error.message
    });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify user is part of conversation
    const [conversations] = await pool.execute(
      'SELECT * FROM Conversations WHERE ConversationID = ?',
      [conversationId]
    );

    if (conversations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const conversation = conversations[0];
    const isParticipant = 
      (conversation.Participant1ID === userId) ||
      (conversation.Participant2ID === userId);

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const [messages] = await pool.execute(
      'SELECT * FROM Messages WHERE ConversationID = ? ORDER BY CreatedAt ASC',
      [conversationId]
    );

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get messages',
      error: error.message
    });
  }
});

// Send message
router.post('/conversations/:conversationId/messages', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { message } = req.body;
    const senderId = req.user.id;
    const senderType = req.user.role;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Get conversation
    const [conversations] = await pool.execute(
      'SELECT * FROM Conversations WHERE ConversationID = ?',
      [conversationId]
    );

    if (conversations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const conversation = conversations[0];
    const receiverId = conversation.Participant1ID === senderId 
      ? conversation.Participant2ID 
      : conversation.Participant1ID;
    const receiverType = conversation.Participant1ID === senderId 
      ? conversation.Participant2Type 
      : conversation.Participant1Type;

    // Create message
    const [result] = await pool.execute(
      `INSERT INTO Messages (ConversationID, SenderID, SenderType, ReceiverID, ReceiverType, Message, IsRead, CreatedAt)
       VALUES (?, ?, ?, ?, ?, ?, FALSE, NOW())`,
      [conversationId, senderId, senderType, receiverId, receiverType, message]
    );

    // Update conversation
    await pool.execute(
      `UPDATE Conversations SET LastMessageAt = NOW(), LastMessageText = ? WHERE ConversationID = ?`,
      [message, conversationId]
    );

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// Create conversation
router.post('/conversations', authenticate, async (req, res) => {
  try {
    const { participantId, participantType } = req.body;
    const participant1Id = req.user.id;
    const participant1Type = req.user.role;

    if (!participantId || !participantType) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID and type are required'
      });
    }

    // Check if conversation already exists
    const [existing] = await pool.execute(
      `SELECT * FROM Conversations 
       WHERE (Participant1ID = ? AND Participant1Type = ? AND Participant2ID = ? AND Participant2Type = ?)
       OR (Participant1ID = ? AND Participant1Type = ? AND Participant2ID = ? AND Participant2Type = ?)`,
      [participant1Id, participant1Type, participantId, participantType,
       participantId, participantType, participant1Id, participant1Type]
    );

    if (existing.length > 0) {
      return res.status(200).json({
        success: true,
        data: existing[0]
      });
    }

    // Create new conversation
    const [result] = await pool.execute(
      `INSERT INTO Conversations (Participant1ID, Participant1Type, Participant2ID, Participant2Type, CreatedAt)
       VALUES (?, ?, ?, ?, NOW())`,
      [participant1Id, participant1Type, participantId, participantType]
    );

    res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create conversation',
      error: error.message
    });
  }
});

module.exports = router;

