
CREATE TABLE IF NOT EXISTS resource_downloads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  workplace TEXT NOT NULL,
  role TEXT NOT NULL,
  resource_name TEXT NOT NULL,
  download_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT
);
CREATE INDEX IF NOT EXISTS idx_resource_downloads_email ON resource_downloads(email);
CREATE INDEX IF NOT EXISTS idx_resource_downloads_resource_name ON resource_downloads(resource_name);
CREATE INDEX IF NOT EXISTS idx_resource_downloads_timestamp ON resource_downloads(download_timestamp);

CREATE INDEX IF NOT EXISTS idx_resource_downloads_email_resource ON resource_downloads(email, resource_name);

CREATE INDEX IF NOT EXISTS idx_resource_downloads_timestamp_resource ON resource_downloads(download_timestamp, resource_name);