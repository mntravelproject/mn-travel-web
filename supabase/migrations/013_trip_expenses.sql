-- Tabela de encargos por viagem (trip_groups)
CREATE TABLE trip_expenses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id      UUID NOT NULL REFERENCES trip_groups(id) ON DELETE CASCADE,
  description  TEXT NOT NULL,
  amount       NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category     TEXT NOT NULL DEFAULT 'outro',
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ON trip_expenses(trip_id);
CREATE INDEX ON trip_expenses(expense_date);
