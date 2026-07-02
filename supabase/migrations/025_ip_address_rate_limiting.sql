ALTER TABLE booking_requests
  ADD COLUMN IF NOT EXISTS ip_address text;

ALTER TABLE contact_requests
  ADD COLUMN IF NOT EXISTS ip_address text;

CREATE INDEX IF NOT EXISTS booking_requests_ip_created
  ON booking_requests (ip_address, created_at DESC);

CREATE INDEX IF NOT EXISTS contact_requests_ip_created
  ON contact_requests (ip_address, created_at DESC);
