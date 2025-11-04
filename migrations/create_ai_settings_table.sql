-- AI Settings Table - جدول إعدادات الذكاء الاصطناعي
CREATE TABLE IF NOT EXISTS AISettings (
    SettingID INT PRIMARY KEY DEFAULT 1,
    ApiKey TEXT NULL, -- Encrypted API key
    Provider VARCHAR(50) NOT NULL DEFAULT 'deepseek',
    Model VARCHAR(100) NOT NULL DEFAULT 'deepseek-chat',
    Temperature DECIMAL(3,2) NOT NULL DEFAULT 0.7,
    MaxTokens INT NOT NULL DEFAULT 2000,
    EnableAIFeatures BOOLEAN NOT NULL DEFAULT TRUE,
    EnableRecommendations BOOLEAN NOT NULL DEFAULT TRUE,
    EnableAnalysis BOOLEAN NOT NULL DEFAULT TRUE,
    ApiEndpoint VARCHAR(500) NOT NULL DEFAULT 'https://api.deepseek.com/v1/chat/completions',
    RequestTimeout INT NOT NULL DEFAULT 30,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_provider (Provider)
) ENGINE=InnoDB;

-- Insert default AI settings if not exists
INSERT IGNORE INTO AISettings (
    SettingID, ApiKey, Provider, Model, Temperature, MaxTokens,
    EnableAIFeatures, EnableRecommendations, EnableAnalysis,
    ApiEndpoint, RequestTimeout
) VALUES (
    1, NULL, 'deepseek', 'deepseek-chat', 0.7, 2000,
    TRUE, TRUE, TRUE,
    'https://api.deepseek.com/v1/chat/completions', 30
);
