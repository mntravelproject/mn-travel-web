-- Remove coluna specialties de travel_packages (fundida com categorias)
ALTER TABLE travel_packages
  DROP COLUMN IF EXISTS specialties;
