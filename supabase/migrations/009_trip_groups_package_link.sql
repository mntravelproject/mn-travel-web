-- ============================================================
-- Liga trip_groups à travel_packages existente (opcional)
-- Execute no Supabase SQL Editor
-- ============================================================

ALTER TABLE trip_groups
  ADD COLUMN package_id UUID REFERENCES travel_packages(id) ON DELETE SET NULL;

CREATE INDEX idx_trip_groups_package ON trip_groups(package_id);
