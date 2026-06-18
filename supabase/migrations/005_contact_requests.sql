-- ============================================================
-- MN Travel — Contact Requests
-- Execute no Supabase SQL Editor
-- ============================================================

CREATE TABLE contact_requests (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL,
  phone      TEXT,
  type       TEXT        NOT NULL DEFAULT 'informacao',
  subject    TEXT,
  message    TEXT        NOT NULL,
  status     TEXT        NOT NULL DEFAULT 'novo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contact_type    ON contact_requests(type);
CREATE INDEX idx_contact_status  ON contact_requests(status);
CREATE INDEX idx_contact_created ON contact_requests(created_at DESC);

CREATE TRIGGER trg_contact_updated_at
  BEFORE UPDATE ON contact_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a contact request
CREATE POLICY "public_insert_contact"
  ON contact_requests FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated (admin) can read and update
CREATE POLICY "admin_all_contact"
  ON contact_requests FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
