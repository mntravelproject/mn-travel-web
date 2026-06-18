-- ============================================================
-- MN Travel — Add available_seats, trip_status, pdf_url
-- Execute no Supabase SQL Editor
-- ============================================================

ALTER TABLE travel_packages
  ADD COLUMN IF NOT EXISTS available_seats INT,
  ADD COLUMN IF NOT EXISTS trip_status     TEXT DEFAULT 'disponivel',
  ADD COLUMN IF NOT EXISTS pdf_url         TEXT;
