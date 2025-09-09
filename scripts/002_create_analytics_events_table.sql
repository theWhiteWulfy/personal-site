
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  event_data TEXT, -- JSON data for event details
  user_email TEXT,
  user_id TEXT,
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_email ON analytics_events(user_email);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type_timestamp ON analytics_events(event_type, timestamp);