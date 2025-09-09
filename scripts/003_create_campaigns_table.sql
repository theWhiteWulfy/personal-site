
CREATE TABLE IF NOT EXISTS campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATETIME NOT NULL,
  end_date DATETIME,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'expired')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS campaign_visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL,
  visit_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  session_id TEXT,
  user_id TEXT,
  conversion_type TEXT, 
  conversion_value REAL DEFAULT 0,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_campaigns_slug ON campaigns(slug);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_status_dates ON campaigns(status, start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_campaign_visits_campaign_id ON campaign_visits(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_visits_timestamp ON campaign_visits(visit_timestamp);
CREATE INDEX IF NOT EXISTS idx_campaign_visits_utm_source ON campaign_visits(utm_source);
CREATE INDEX IF NOT EXISTS idx_campaign_visits_utm_campaign ON campaign_visits(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_campaign_visits_conversion_type ON campaign_visits(conversion_type);
CREATE INDEX IF NOT EXISTS idx_campaign_visits_session ON campaign_visits(session_id);

CREATE INDEX IF NOT EXISTS idx_campaign_visits_campaign_timestamp ON campaign_visits(campaign_id, visit_timestamp);
CREATE INDEX IF NOT EXISTS idx_campaign_visits_utm_source_medium ON campaign_visits(utm_source, utm_medium);
CREATE INDEX IF NOT EXISTS idx_campaign_visits_conversion_campaign ON campaign_visits(conversion_type, campaign_id);