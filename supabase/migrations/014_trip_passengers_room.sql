-- Adicionar tipo de quarto e agrupamento por quarto aos passageiros
ALTER TABLE trip_passengers
  ADD COLUMN IF NOT EXISTS room_type       TEXT    NOT NULL DEFAULT 'individual',
  ADD COLUMN IF NOT EXISTS room_id         UUID,
  ADD COLUMN IF NOT EXISTS is_main_occupant BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS ON trip_passengers(room_id);
