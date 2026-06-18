-- ============================================================
-- MN Travel — Gestão de Grupos / Viagens internas
-- Execute no Supabase SQL Editor
-- ============================================================

-- Viagens internas (diferente das travel_packages públicas)
CREATE TABLE trip_groups (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title            TEXT        NOT NULL,
  destination      TEXT        NOT NULL,
  start_date       DATE        NOT NULL,
  end_date         DATE        NOT NULL,
  price_per_person NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Passageiros por viagem
CREATE TABLE trip_passengers (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id         UUID        NOT NULL REFERENCES trip_groups(id) ON DELETE CASCADE,
  full_name       TEXT        NOT NULL,
  id_card_number  TEXT,
  id_card_expiry  DATE,
  nif             TEXT,
  date_of_birth   DATE,
  nationality     TEXT        DEFAULT 'Portuguesa',
  phone           TEXT,
  email           TEXT,
  notes           TEXT,
  sort_order      INT         NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Pagamentos por passageiro
CREATE TABLE trip_payments (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  passenger_id   UUID        NOT NULL REFERENCES trip_passengers(id) ON DELETE CASCADE,
  amount         NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  payment_date   DATE        NOT NULL DEFAULT CURRENT_DATE,
  method         TEXT        NOT NULL DEFAULT 'transfer',
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_trip_passengers_trip  ON trip_passengers(trip_id);
CREATE INDEX idx_trip_payments_pax     ON trip_payments(passenger_id);
CREATE INDEX idx_trip_groups_dates     ON trip_groups(start_date, end_date);

-- Triggers para updated_at
CREATE TRIGGER trg_trip_groups_updated_at
  BEFORE UPDATE ON trip_groups
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_trip_passengers_updated_at
  BEFORE UPDATE ON trip_passengers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE trip_groups     ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_payments   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_all_trip_groups"
  ON trip_groups FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "auth_all_trip_passengers"
  ON trip_passengers FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "auth_all_trip_payments"
  ON trip_payments FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
