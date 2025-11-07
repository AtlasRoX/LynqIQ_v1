-- Add settings columns to the profiles table

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_alerts BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS dark_mode BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS auto_backup BOOLEAN DEFAULT true;
