-- Tornar o campo email opcional na tabela clients
ALTER TABLE clients ALTER COLUMN email DROP NOT NULL;
