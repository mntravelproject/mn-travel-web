-- Adicionar campos de documentos de viagem à tabela clients
-- Permite pré-preencher e sincronizar dados entre clientes e passageiros

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS id_card_number TEXT,
  ADD COLUMN IF NOT EXISTS id_card_expiry DATE,
  ADD COLUMN IF NOT EXISTS nif            TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth  DATE,
  ADD COLUMN IF NOT EXISTS nationality    TEXT DEFAULT 'Portuguesa';
