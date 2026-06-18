-- ============================================================
-- MN Travel — Seed default categories
-- Execute no Supabase SQL Editor
-- ============================================================

INSERT INTO categories (name, slug, description) VALUES
  ('Circuitos',       'circuitos',       'Viagens com percurso por múltiplos destinos'),
  ('Escapadinhas',    'escapadinhas',    'Fugas de fim de semana e estadas curtas'),
  ('Grandes Viagens', 'grandes-viagens', 'Expedições longas e inesquecíveis'),
  ('Cruzeiros',       'cruzeiros',       'Viagens em cruzeiro de luxo'),
  ('Lua de mel',      'lua-de-mel',      'Experiências românticas e exclusivas para casais'),
  ('Aventura',        'aventura',        'Viagens para espíritos aventureiros'),
  ('Cultural',        'cultural',        'Imersão na história, arte e gastronomia local'),
  ('Relax & Spa',     'relax-spa',       'Retiros de bem-estar e luxo')
ON CONFLICT (slug) DO NOTHING;
