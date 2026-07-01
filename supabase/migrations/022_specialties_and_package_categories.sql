-- Create package_categories junction table (múltiplas categorias por destino)
CREATE TABLE IF NOT EXISTS package_categories (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id  uuid NOT NULL REFERENCES travel_packages(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(package_id, category_id)
);

ALTER TABLE package_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "package_categories_public_read" ON package_categories
  FOR SELECT USING (true);

CREATE POLICY "package_categories_auth_write" ON package_categories
  FOR ALL USING (auth.role() = 'authenticated');

-- Migrar dados existentes de category_id para a junction table
INSERT INTO package_categories (package_id, category_id)
SELECT id, category_id
FROM travel_packages
WHERE category_id IS NOT NULL
ON CONFLICT (package_id, category_id) DO NOTHING;
