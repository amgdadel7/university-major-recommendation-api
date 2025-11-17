/**
 * AI Routes / مسارات الذكاء الاصطناعي
 * This file handles all AI-related API endpoints
 * هذا الملف يتعامل مع جميع نقاط نهاية API المتعلقة بالذكاء الاصطناعي
 */

const express = require('express');
const router = express.Router(); // Express router instance / مثيل موجه Express

const { authenticate } = require('../middleware/auth'); // Authentication middleware / برمجية المصادقة
const { getAIConfig, isConfigured } = require('../services/deepseek'); // AI configuration services / خدمات تكوين AI

/**
 * GET /api/v1/ai/settings
 * Get AI configuration (without exposing API keys) / الحصول على تكوين AI (دون كشف مفاتيح API)
 * Returns AI configuration settings without sensitive data
 * يعيد إعدادات تكوين AI دون البيانات الحساسة
 */
router.get('/settings', authenticate, async (req, res) => {
  try {
    const config = await getAIConfig();
    const configured = await isConfigured({ config });

    res.json({
      success: true,
      data: {
        isConfigured: configured,
        provider: config.provider,
        model: config.model,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        enableAIFeatures: config.enableAIFeatures,
        enableRecommendations: config.enableRecommendations,
        enableAnalysis: config.enableAnalysis,
        apiEndpoint: config.apiEndpoint,
        requestTimeout: config.requestTimeout
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI configuration',
      error: error.message
    });
  }
});

module.exports = router;

