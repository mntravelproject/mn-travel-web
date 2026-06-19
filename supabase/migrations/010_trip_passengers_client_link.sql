-- ============================================================
-- Liga trip_passengers à tabela clients
-- Execute no Supabase SQL Editor
-- ============================================================

ALTER TABLE trip_passengers
  ADD COLUMN client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

CREATE INDEX idx_trip_passengers_client ON trip_passengers(client_id);
