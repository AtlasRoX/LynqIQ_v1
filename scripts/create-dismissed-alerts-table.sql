-- Create dismissed_alerts table to track which alerts users have dismissed
CREATE TABLE IF NOT EXISTS dismissed_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  alert_id TEXT NOT NULL,
  dismissed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, alert_id)
);

-- Enable RLS
ALTER TABLE dismissed_alerts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see and manage their own dismissed alerts
CREATE POLICY "Users can manage their own dismissed alerts" 
  ON dismissed_alerts 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_dismissed_alerts_user_id ON dismissed_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_dismissed_alerts_alert_id ON dismissed_alerts(user_id, alert_id);
