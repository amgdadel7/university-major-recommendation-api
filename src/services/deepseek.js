/**
 * DeepSeek AI Service / خدمة الذكاء الاصطناعي DeepSeek
 * This file handles integration with DeepSeek AI API for generating major recommendations
 * هذا الملف يتعامل مع تكامل واجهة برمجة تطبيقات DeepSeek AI لتوليد توصيات التخصصات
 */

const axios = require('axios');
const pool = require('../config/database');

// Default Configuration Constants / ثوابت التكوين الافتراضية
const DEFAULT_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions'; // DeepSeek API endpoint / نقطة نهاية API لـ DeepSeek
const DEFAULT_MODEL = 'deepseek-chat'; // Default AI model / نموذج AI الافتراضي
const DEFAULT_TEMPERATURE = 0.7; // Default temperature for AI responses / درجة الحرارة الافتراضية لاستجابات AI
const DEFAULT_MAX_TOKENS = 2000; // Default maximum tokens in response / الحد الأقصى الافتراضي للرموز في الاستجابة
const DEFAULT_TIMEOUT_SECONDS = 30; // Default request timeout in seconds / انتهاء مهلة الطلب الافتراضي بالثواني
const CACHE_TTL_MS = 60 * 1000; // Cache time-to-live: 1 minute / وقت بقاء التخزين المؤقت: دقيقة واحدة

// Configuration Cache / تخزين مؤقت للتكوين
let cachedConfig = null; // Cached AI configuration / تكوين AI المخزن مؤقتاً
let cacheTimestamp = 0; // Timestamp when config was cached / الطابع الزمني عند تخزين التكوين مؤقتاً

// Truthy Values Set / مجموعة القيم الصحيحة
// Used for parsing boolean values from strings / تُستخدم لتحليل القيم المنطقية من السلاسل
const truthyValues = new Set(['1', 'true', 'yes', 'on']);

/**
 * Parse Boolean Value / تحليل القيمة المنطقية
 * Converts various input types to boolean
 * يحول أنواع الإدخال المختلفة إلى منطقي
 * @param {*} value - Value to parse / القيمة المراد تحليلها
 * @param {boolean} fallback - Default value if parsing fails / القيمة الافتراضية إذا فشل التحليل
 * @returns {boolean} Parsed boolean value / القيمة المنطقية المحللة
 */
function parseBoolean(value, fallback = true) {
  if (value === undefined || value === null) {
    return fallback; // Return fallback for null/undefined / إرجاع القيمة الافتراضية للقيم الفارغة
  }
  if (typeof value === 'boolean') {
    return value; // Return boolean as-is / إرجاع القيمة المنطقية كما هي
  }
  if (typeof value === 'number') {
    return value === 1; // 1 = true, others = false / 1 = صحيح، الباقي = خطأ
  }
  if (typeof value === 'string') {
    // Check if string is in truthy values set / التحقق من أن السلسلة في مجموعة القيم الصحيحة
    return truthyValues.has(value.trim().toLowerCase());
  }
  return fallback; // Return fallback for unknown types / إرجاع القيمة الافتراضية للأنواع غير المعروفة
}

/**
 * Parse Number Value / تحليل القيمة الرقمية
 * Converts input to number, returns fallback if invalid
 * يحول الإدخال إلى رقم، يعيد القيمة الافتراضية إذا كان غير صالح
 * @param {*} value - Value to parse / القيمة المراد تحليلها
 * @param {number} fallback - Default value if parsing fails / القيمة الافتراضية إذا فشل التحليل
 * @returns {number} Parsed number value / القيمة الرقمية المحللة
 */
function parseNumber(value, fallback) {
  const numberValue = Number(value);
  if (Number.isFinite(numberValue)) {
    return numberValue; // Return valid number / إرجاع الرقم الصالح
  }
  return fallback; // Return fallback for invalid numbers / إرجاع القيمة الافتراضية للأرقام غير الصالحة
}

/**
 * Parse Timeout Seconds / تحليل ثواني انتهاء المهلة
 * Converts timeout value to seconds, handles milliseconds for backward compatibility
 * يحول قيمة انتهاء المهلة إلى ثواني، يتعامل مع الميلي ثواني للتوافق مع الإصدارات السابقة
 * @param {*} value - Timeout value to parse / قيمة انتهاء المهلة المراد تحليلها
 * @param {number} fallback - Default timeout in seconds / انتهاء المهلة الافتراضي بالثواني
 * @returns {number} Timeout in seconds / انتهاء المهلة بالثواني
 */
function parseTimeoutSeconds(value, fallback = DEFAULT_TIMEOUT_SECONDS) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return fallback; // Return fallback for invalid values / إرجاع القيمة الافتراضية للقيم غير الصالحة
  }
  // Accept milliseconds for backward compatibility
  // قبول الميلي ثواني للتوافق مع الإصدارات السابقة
  if (numeric > 120) {
    // Assume milliseconds if value > 120 / افتراض الميلي ثواني إذا كانت القيمة > 120
    return Math.round(numeric / 1000); // Convert to seconds / التحويل إلى ثواني
  }
  return numeric; // Return as seconds / إرجاع كثواني
}

// Environment Fallback Configuration / تكوين احتياطي من المتغيرات البيئية
// Configuration loaded from environment variables if database settings are unavailable
// التكوين المحمّل من المتغيرات البيئية إذا كانت إعدادات قاعدة البيانات غير متاحة
const ENV_FALLBACK_CONFIG = {
  apiKey:
    process.env.DEEPSEEK_API_KEY || // Primary API key variable / متغير مفتاح API الأساسي
    process.env.DEEPSEEK_API_TOKEN || // Alternative API key variable / متغير مفتاح API البديل
    '', // Empty string if not set / سلسلة فارغة إذا لم يتم التعيين
  provider: process.env.AI_PROVIDER || 'deepseek', // AI provider name / اسم مزود AI
  model: process.env.DEEPSEEK_MODEL || DEFAULT_MODEL, // AI model name / اسم نموذج AI
  temperature: parseNumber(process.env.DEEPSEEK_TEMPERATURE, DEFAULT_TEMPERATURE), // AI temperature / درجة حرارة AI
  maxTokens: parseNumber(process.env.DEEPSEEK_MAX_TOKENS, DEFAULT_MAX_TOKENS), // Maximum tokens / الحد الأقصى للرموز
  enableAIFeatures: parseBoolean(process.env.ENABLE_AI_FEATURES, true), // Enable AI features flag / علامة تفعيل ميزات AI
  enableRecommendations: parseBoolean(process.env.ENABLE_AI_RECOMMENDATIONS, true), // Enable recommendations flag / علامة تفعيل التوصيات
  enableAnalysis: parseBoolean(process.env.ENABLE_AI_ANALYSIS, true), // Enable analysis flag / علامة تفعيل التحليل
  apiEndpoint: process.env.DEEPSEEK_API_ENDPOINT || DEFAULT_ENDPOINT, // API endpoint URL / عنوان URL لنقطة نهاية API
  requestTimeout: parseTimeoutSeconds(process.env.DEEPSEEK_TIMEOUT, DEFAULT_TIMEOUT_SECONDS) // Request timeout / انتهاء مهلة الطلب
};

/**
 * Fetch AI Settings from Database / جلب إعدادات AI من قاعدة البيانات
 * Retrieves AI configuration from the AISettings table
 * يسترجع تكوين AI من جدول AISettings
 * @returns {Object|null} AI settings object or null if not found / كائن إعدادات AI أو null إذا لم يتم العثور عليه
 */
async function fetchSettingsFromDatabase() {
  try {
    // Query AI settings from database / استعلام إعدادات AI من قاعدة البيانات
    const [rows] = await pool.execute('SELECT * FROM AISettings WHERE SettingID = 1');
    return rows[0] || null; // Return first row or null / إرجاع الصف الأول أو null
  } catch (error) {
    // Error fetching settings - return null / خطأ في جلب الإعدادات - إرجاع null
    return null;
  }
}

/**
 * Build AI Configuration / بناء تكوين AI
 * Combines database settings with environment fallback values
 * يجمع إعدادات قاعدة البيانات مع قيم الاحتياطي من المتغيرات البيئية
 * @param {Object|null} dbSettings - Database settings object / كائن إعدادات قاعدة البيانات
 * @returns {Object} Complete AI configuration object / كائن تكوين AI كامل
 */
function buildConfig(dbSettings) {
  // If no database settings, use environment fallback / إذا لم تكن هناك إعدادات قاعدة بيانات، استخدم الاحتياطي من المتغيرات البيئية
  if (!dbSettings) {
    return { ...ENV_FALLBACK_CONFIG };
  }

  // Merge database settings with environment fallback / دمج إعدادات قاعدة البيانات مع الاحتياطي من المتغيرات البيئية
  return {
    apiKey: dbSettings.ApiKey || ENV_FALLBACK_CONFIG.apiKey, // API key from DB or env / مفتاح API من قاعدة البيانات أو المتغيرات البيئية
    provider: dbSettings.Provider || ENV_FALLBACK_CONFIG.provider, // Provider from DB or env / المزود من قاعدة البيانات أو المتغيرات البيئية
    model: dbSettings.Model || ENV_FALLBACK_CONFIG.model, // Model from DB or env / النموذج من قاعدة البيانات أو المتغيرات البيئية
    temperature: parseNumber(dbSettings.Temperature, ENV_FALLBACK_CONFIG.temperature), // Temperature from DB or env / درجة الحرارة من قاعدة البيانات أو المتغيرات البيئية
    maxTokens: parseNumber(dbSettings.MaxTokens, ENV_FALLBACK_CONFIG.maxTokens), // Max tokens from DB or env / الحد الأقصى للرموز من قاعدة البيانات أو المتغيرات البيئية
    enableAIFeatures: parseBoolean(
      dbSettings.EnableAIFeatures,
      ENV_FALLBACK_CONFIG.enableAIFeatures
    ), // Enable AI features from DB or env / تفعيل ميزات AI من قاعدة البيانات أو المتغيرات البيئية
    enableRecommendations: parseBoolean(
      dbSettings.EnableRecommendations,
      ENV_FALLBACK_CONFIG.enableRecommendations
    ), // Enable recommendations from DB or env / تفعيل التوصيات من قاعدة البيانات أو المتغيرات البيئية
    enableAnalysis: parseBoolean(
      dbSettings.EnableAnalysis,
      ENV_FALLBACK_CONFIG.enableAnalysis
    ), // Enable analysis from DB or env / تفعيل التحليل من قاعدة البيانات أو المتغيرات البيئية
    apiEndpoint: dbSettings.ApiEndpoint || ENV_FALLBACK_CONFIG.apiEndpoint, // Endpoint from DB or env / نقطة النهاية من قاعدة البيانات أو المتغيرات البيئية
    requestTimeout: parseTimeoutSeconds(
      dbSettings.RequestTimeout,
      ENV_FALLBACK_CONFIG.requestTimeout
    ) // Timeout from DB or env / انتهاء المهلة من قاعدة البيانات أو المتغيرات البيئية
  };
}

/**
 * Get AI Configuration / الحصول على تكوين AI
 * Retrieves AI configuration with caching support
 * يسترجع تكوين AI مع دعم التخزين المؤقت
 * @param {Object} options - Options object / كائن الخيارات
 * @param {boolean} options.useCache - Whether to use cached config / ما إذا كان يجب استخدام التكوين المخزن مؤقتاً
 * @returns {Object} AI configuration object / كائن تكوين AI
 */
async function getAIConfig(options = {}) {
  const useCache = options.useCache !== false; // Default to using cache / افتراضي لاستخدام التخزين المؤقت

  // Return cached config if valid and cache is enabled / إرجاع التكوين المخزن مؤقتاً إذا كان صالحاً وتم تفعيل التخزين المؤقت
  if (useCache && cachedConfig && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedConfig;
  }

  // Fetch fresh settings from database / جلب إعدادات جديدة من قاعدة البيانات
  const dbSettings = await fetchSettingsFromDatabase();
  cachedConfig = buildConfig(dbSettings); // Build and cache config / بناء التكوين وتخزينه مؤقتاً
  cacheTimestamp = Date.now(); // Update cache timestamp / تحديث الطابع الزمني للتخزين المؤقت
  return cachedConfig;
}

/**
 * Check if API Key is Usable / التحقق من أن مفتاح API قابل للاستخدام
 * Validates that the configuration has a non-empty API key
 * يتحقق من أن التكوين يحتوي على مفتاح API غير فارغ
 * @param {Object} config - Configuration object / كائن التكوين
 * @returns {boolean} True if API key is usable / true إذا كان مفتاح API قابلاً للاستخدام
 */
function hasUsableApiKey(config) {
  return Boolean(config?.apiKey && config.apiKey.trim()); // Check for non-empty API key / التحقق من مفتاح API غير فارغ
}

/**
 * Check if AI is Configured / التحقق من تكوين AI
 * Verifies that AI is properly configured and enabled
 * يتحقق من أن AI مُكوّن بشكل صحيح ومفعل
 * @param {Object} options - Options object / كائن الخيارات
 * @param {Object} options.config - Optional config to check / تكوين اختياري للتحقق
 * @returns {boolean} True if AI is configured and enabled / true إذا كان AI مُكوّناً ومفعلاً
 */
async function isConfigured(options = {}) {
  const config = options.config || (await getAIConfig(options)); // Get config if not provided / الحصول على التكوين إذا لم يتم توفيره
  return (
    hasUsableApiKey(config) && // Must have valid API key / يجب أن يكون لديه مفتاح API صالح
    config.enableAIFeatures !== false && // AI features must be enabled / يجب تفعيل ميزات AI
    config.enableRecommendations !== false // Recommendations must be enabled / يجب تفعيل التوصيات
  );
}

/**
 * Generate AI Recommendations / توليد توصيات AI
 * Sends request to DeepSeek API to generate major recommendations
 * يرسل طلباً إلى واجهة برمجة تطبيقات DeepSeek لتوليد توصيات التخصصات
 * @param {Array} promptPayload - Array of message objects for the AI / مصفوفة كائنات الرسائل لـ AI
 * @param {Object} options - Options object / كائن الخيارات
 * @param {Object} options.config - Optional config to use / تكوين اختياري للاستخدام
 * @returns {Object} Parsed JSON response with recommendations / استجابة JSON محللة مع التوصيات
 * @throws {Error} If API key is missing, features are disabled, or API call fails
 * @throws {Error} إذا كان مفتاح API مفقوداً، أو تم تعطيل الميزات، أو فشلت استدعاءات API
 */
async function generateRecommendations(promptPayload, options = {}) {
  const config = options.config || (await getAIConfig(options)); // Get AI configuration / الحصول على تكوين AI

  // Validate API key / التحقق من مفتاح API
  if (!hasUsableApiKey(config)) {
    throw new Error('DeepSeek API key is not configured. Please update AI settings.');
  }

  // Check if AI features are enabled / التحقق من تفعيل ميزات AI
  if (!config.enableAIFeatures) {
    throw new Error('AI features are disabled by the administrator.');
  }

  // Check if recommendations are enabled / التحقق من تفعيل التوصيات
  if (!config.enableRecommendations) {
    throw new Error('AI recommendations are disabled by the administrator.');
  }

  // Build request body for DeepSeek API / بناء جسم الطلب لواجهة برمجة تطبيقات DeepSeek
  const requestBody = {
    model: config.model, // AI model to use / نموذج AI للاستخدام
    temperature: config.temperature, // Response creativity / إبداعية الاستجابة
    max_tokens: config.maxTokens, // Maximum response length / الحد الأقصى لطول الاستجابة
    response_format: { type: 'json_object' }, // Force JSON response / إجبار استجابة JSON
    messages: [
      {
        role: 'system', // System message defining AI behavior / رسالة النظام التي تحدد سلوك AI
        content:
          'You are an AI academic advisor. Always return valid JSON with the schema: { "recommendations": [ { "majorName": string, "reason": string, "confidence": number } ], "analysisSummary": string }. Confidence must be between 0 and 100. Use Arabic language for explanations.'
      },
      ...promptPayload // User messages / رسائل المستخدم
    ]
  };

  // Calculate timeout in milliseconds / حساب انتهاء المهلة بالميلي ثواني
  const timeoutMs = Math.max(5, config.requestTimeout || DEFAULT_TIMEOUT_SECONDS) * 1000;

  // Send request to DeepSeek API / إرسال طلب إلى واجهة برمجة تطبيقات DeepSeek
  const response = await axios.post(config.apiEndpoint, requestBody, {
    headers: {
      'Content-Type': 'application/json', // JSON content type / نوع محتوى JSON
      Authorization: `Bearer ${config.apiKey}` // API key authentication / مصادقة مفتاح API
    },
    timeout: timeoutMs // Request timeout / انتهاء مهلة الطلب
  });

  // Extract content from response / استخراج المحتوى من الاستجابة
  const content = response?.data?.choices?.[0]?.message?.content;

  // Validate response content / التحقق من محتوى الاستجابة
  if (!content) {
    throw new Error('DeepSeek response did not contain any content.');
  }

  // Parse JSON response / تحليل استجابة JSON
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse DeepSeek response as JSON: ${error.message}`);
  }
}

/**
 * Invalidate AI Configuration Cache / إبطال التخزين المؤقت لتكوين AI
 * Clears the cached configuration to force refresh on next request
 * يمسح التكوين المخزن مؤقتاً لإجبار التحديث في الطلب التالي
 */
function invalidateAIConfigCache() {
  cachedConfig = null; // Clear cached config / مسح التكوين المخزن مؤقتاً
  cacheTimestamp = 0; // Reset cache timestamp / إعادة تعيين الطابع الزمني للتخزين المؤقت
}

module.exports = {
  getAIConfig,
  isConfigured,
  generateRecommendations,
  invalidateAIConfigCache
};