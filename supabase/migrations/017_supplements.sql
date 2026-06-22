-- Suplementos de alojamento por destino e por viagem de grupo
ALTER TABLE travel_packages
  ADD COLUMN IF NOT EXISTS individual_supplement NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS triple_supplement     NUMERIC(10,2) NOT NULL DEFAULT 0;

ALTER TABLE trip_groups
  ADD COLUMN IF NOT EXISTS individual_supplement NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS triple_supplement     NUMERIC(10,2) NOT NULL DEFAULT 0;
