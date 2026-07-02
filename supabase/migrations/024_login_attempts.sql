CREATE TABLE IF NOT EXISTS login_attempts (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address  text        NOT NULL,
  attempted_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS login_attempts_ip_time
  ON login_attempts (ip_address, attempted_at DESC);

-- Auto-clean entries older than 24 hours to keep the table small
CREATE OR REPLACE FUNCTION cleanup_old_login_attempts() RETURNS void
LANGUAGE sql SECURITY DEFINER AS $$
  DELETE FROM login_attempts WHERE attempted_at < now() - interval '24 hours';
$$;

ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
-- Only service role (admin client) can read/write — no public access
