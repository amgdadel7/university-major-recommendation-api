-- Migration: Add missing columns to Universities table
-- Description: Adds all fields required by the frontend interface
-- Date: 2024

-- Add EnglishName column
ALTER TABLE Universities 
ADD COLUMN EnglishName VARCHAR(200) NULL AFTER Name;

-- Add Email column
ALTER TABLE Universities 
ADD COLUMN Email VARCHAR(100) NULL AFTER Location;

-- Add Phone column
ALTER TABLE Universities 
ADD COLUMN Phone VARCHAR(20) NULL AFTER Email;

-- Add Website column
ALTER TABLE Universities 
ADD COLUMN Website VARCHAR(200) NULL AFTER Phone;

-- Add AccountStatus column (active, pending, rejected)
ALTER TABLE Universities 
ADD COLUMN AccountStatus ENUM('active', 'pending', 'rejected') DEFAULT 'pending' AFTER Website;

-- Add ActiveStatus column (active, inactive)
ALTER TABLE Universities 
ADD COLUMN ActiveStatus ENUM('active', 'inactive') DEFAULT 'active' AFTER AccountStatus;

-- Add CreatedAt column
ALTER TABLE Universities 
ADD COLUMN CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP AFTER ActiveStatus;

-- Add ApprovedAt column
ALTER TABLE Universities 
ADD COLUMN ApprovedAt DATETIME NULL AFTER CreatedAt;

-- Update existing universities to have active status and current timestamp
UPDATE Universities 
SET AccountStatus = 'active',
    ActiveStatus = 'active',
    CreatedAt = NOW(),
    ApprovedAt = NOW()
WHERE CreatedAt IS NULL OR CreatedAt = '0000-00-00 00:00:00';

-- Create indexes for better query performance
CREATE INDEX idx_account_status ON Universities(AccountStatus);
CREATE INDEX idx_active_status ON Universities(ActiveStatus);
CREATE INDEX idx_created_at ON Universities(CreatedAt);

