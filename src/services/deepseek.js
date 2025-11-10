const axios = require('axios');
const pool = require('../config/database');

const DEFAULT_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';
const DEFAULT_MODEL = 'deepseek-chat';
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 2000;
const DEFAULT_TIMEOUT_SECONDS = 30;
const CACHE_TTL_MS = 60 * 1000;

let cachedConfig = null;
let cacheTimestamp = 0;

const truthyValues = new Set(['1', 'true', 'yes', 'on']);

function parseBoolean(value, fallback = true) {
  if (value === undefined || value === null) {
    return fallback;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  if (typeof value === 'string') {
    return truthyValues.has(value.trim().toLowerCase());
  }
  return fallback;
}

function parseNumber(value, fallback) {
  const numberValue = Number(value);
  if (Number.isFinite(numberValue)) {
    return numberValue;
  }
  return fallback;
}

function parseTimeoutSeconds(value, fallback = DEFAULT_TIMEOUT_SECONDS) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return fallback;
  }
  // Accept milliseconds for backward compatibility
  if (numeric > 120) {
    return Math.round(numeric / 1000);
  }
  return numeric;
}

const ENV_FALLBACK_CONFIG = {
  apiKey:
    process.env.DEEPSEEK_API_KEY ||
    process.env.DEEPSEEK_API_TOKEN ||
    '',
  provider: process.env.AI_PROVIDER || 'deepseek',
  model: process.env.DEEPSEEK_MODEL || DEFAULT_MODEL,
  temperature: parseNumber(process.env.DEEPSEEK_TEMPERATURE, DEFAULT_TEMPERATURE),
  maxTokens: parseNumber(process.env.DEEPSEEK_MAX_TOKENS, DEFAULT_MAX_TOKENS),
  enableAIFeatures: parseBoolean(process.env.ENABLE_AI_FEATURES, true),
  enableRecommendations: parseBoolean(process.env.ENABLE_AI_RECOMMENDATIONS, true),
  enableAnalysis: parseBoolean(process.env.ENABLE_AI_ANALYSIS, true),
  apiEndpoint: process.env.DEEPSEEK_API_ENDPOINT || DEFAULT_ENDPOINT,
  requestTimeout: parseTimeoutSeconds(process.env.DEEPSEEK_TIMEOUT, DEFAULT_TIMEOUT_SECONDS)
};

async function fetchSettingsFromDatabase() {
  try {
    const [rows] = await pool.execute('SELECT * FROM AISettings WHERE SettingID = 1');
    return rows[0] || null;
  } catch (error) {
    console.error('Failed to load AI settings from database:', error);
    return null;
  }
}

function buildConfig(dbSettings) {
  if (!dbSettings) {
    return { ...ENV_FALLBACK_CONFIG };
  }

  return {
    apiKey: dbSettings.ApiKey || ENV_FALLBACK_CONFIG.apiKey,
    provider: dbSettings.Provider || ENV_FALLBACK_CONFIG.provider,
    model: dbSettings.Model || ENV_FALLBACK_CONFIG.model,
    temperature: parseNumber(dbSettings.Temperature, ENV_FALLBACK_CONFIG.temperature),
    maxTokens: parseNumber(dbSettings.MaxTokens, ENV_FALLBACK_CONFIG.maxTokens),
    enableAIFeatures: parseBoolean(
      dbSettings.EnableAIFeatures,
      ENV_FALLBACK_CONFIG.enableAIFeatures
    ),
    enableRecommendations: parseBoolean(
      dbSettings.EnableRecommendations,
      ENV_FALLBACK_CONFIG.enableRecommendations
    ),
    enableAnalysis: parseBoolean(
      dbSettings.EnableAnalysis,
      ENV_FALLBACK_CONFIG.enableAnalysis
    ),
    apiEndpoint: dbSettings.ApiEndpoint || ENV_FALLBACK_CONFIG.apiEndpoint,
    requestTimeout: parseTimeoutSeconds(
      dbSettings.RequestTimeout,
      ENV_FALLBACK_CONFIG.requestTimeout
    )
  };
}

async function getAIConfig(options = {}) {
  const useCache = options.useCache !== false;

  if (useCache && cachedConfig && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedConfig;
  }

  const dbSettings = await fetchSettingsFromDatabase();
  cachedConfig = buildConfig(dbSettings);
  cacheTimestamp = Date.now();
  return cachedConfig;
}

function hasUsableApiKey(config) {
  return Boolean(config?.apiKey && config.apiKey.trim());
}

async function isConfigured(options = {}) {
  const config = options.config || (await getAIConfig(options));
  return (
    hasUsableApiKey(config) &&
    config.enableAIFeatures !== false &&
    config.enableRecommendations !== false
  );
}

async function generateRecommendations(promptPayload, options = {}) {
  const config = options.config || (await getAIConfig(options));

  if (!hasUsableApiKey(config)) {
    throw new Error('DeepSeek API key is not configured. Please update AI settings.');
  }

  if (!config.enableAIFeatures) {
    throw new Error('AI features are disabled by the administrator.');
  }

  if (!config.enableRecommendations) {
    throw new Error('AI recommendations are disabled by the administrator.');
  }

  const requestBody = {
    model: config.model,
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You are an AI academic advisor. Always return valid JSON with the schema: { "recommendations": [ { "majorName": string, "reason": string, "confidence": number } ], "analysisSummary": string }. Confidence must be between 0 and 100. Use Arabic language for explanations.'
      },
      ...promptPayload
    ]
  };

  const timeoutMs = Math.max(5, config.requestTimeout || DEFAULT_TIMEOUT_SECONDS) * 1000;

  const response = await axios.post(config.apiEndpoint, requestBody, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`
    },
    timeout: timeoutMs
  });

  const content = response?.data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('DeepSeek response did not contain any content.');
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse DeepSeek response as JSON: ${error.message}`);
  }
}

function invalidateAIConfigCache() {
  cachedConfig = null;
  cacheTimestamp = 0;
}

module.exports = {
  getAIConfig,
  isConfigured,
  generateRecommendations,
  invalidateAIConfigCache
};