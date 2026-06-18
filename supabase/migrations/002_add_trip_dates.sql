-- ============================================================
-- MN Travel — Add departure and return dates to travel_packages
-- Execute no Supabase SQL Editor
-- ============================================================

ALTER TABLE travel_packages
  ADD COLUMN IF NOT EXISTS departure_date DATE,
  ADD COLUMN IF NOT EXISTS return_date    DATE;
