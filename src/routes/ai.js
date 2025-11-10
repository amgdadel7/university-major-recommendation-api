const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/auth');
const { getAIConfig, isConfigured } = require('../services/deepseek');

// Get AI configuration (without exposing API keys)
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
    console.error('Failed to fetch AI configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI configuration',
      error: error.message
    });
  }
});

module.exports = router;

