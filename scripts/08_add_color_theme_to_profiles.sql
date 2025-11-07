-- Add color_theme column to profiles table for custom theme selection

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS color_theme TEXT DEFAULT 'emerald';
