-- ============================================================
-- MN Travel — Clients
-- Execute no Supabase SQL Editor
-- ============================================================

CREATE TABLE clients (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL UNIQUE,
  phone      TEXT,
  country    TEXT,
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_email   ON clients(email);
CREATE INDEX idx_clients_created ON clients(created_at DESC);

CREATE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_clients"
  ON clients FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
