-- ============================================================
-- MN Travel — Initial Schema
-- Execute no Supabase SQL Editor
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE categories (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT        NOT NULL,
  slug        TEXT        NOT NULL UNIQUE,
  description TEXT,
  image_url   TEXT,
  trip_count  INT         NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- DESTINATIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE destinations (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT        NOT NULL,
  slug        TEXT        NOT NULL UNIQUE,
  country     TEXT        NOT NULL,
  description TEXT,
  image_url   TEXT        NOT NULL,
  trip_count  INT         NOT NULL DEFAULT 0,
  is_featured BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TRAVEL PACKAGES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE travel_packages (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug              TEXT        NOT NULL UNIQUE,
  title             TEXT        NOT NULL,
  short_description TEXT,
  long_description  TEXT,
  country           TEXT        NOT NULL,
  destination_id    UUID        REFERENCES destinations(id) ON DELETE SET NULL,
  category_id       UUID        REFERENCES categories(id)   ON DELETE SET NULL,
  duration_days     INT         NOT NULL,
  nights            INT         NOT NULL,
  price_from        NUMERIC(10, 2) NOT NULL,
  rating            NUMERIC(3, 2)  NOT NULL DEFAULT 0,
  review_count      INT         NOT NULL DEFAULT 0,
  hero_image_url    TEXT,
  tag               TEXT,
  is_featured       BOOLEAN     NOT NULL DEFAULT false,
  is_published      BOOLEAN     NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- PACKAGE IMAGES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE package_images (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id  UUID        NOT NULL REFERENCES travel_packages(id) ON DELETE CASCADE,
  image_url   TEXT        NOT NULL,
  alt_text    TEXT,
  sort_order  INT         NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- PACKAGE ITINERARY
-- ─────────────────────────────────────────────────────────────
CREATE TABLE package_itinerary (
  id          UUID  DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id  UUID  NOT NULL REFERENCES travel_packages(id) ON DELETE CASCADE,
  day_label   TEXT  NOT NULL,   -- e.g. "Dia 1–2"
  title       TEXT  NOT NULL,
  description TEXT  NOT NULL,
  sort_order  INT   NOT NULL DEFAULT 0
);

-- ─────────────────────────────────────────────────────────────
-- TESTIMONIALS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE testimonials (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id    UUID        REFERENCES travel_packages(id) ON DELETE SET NULL,
  author_name   TEXT        NOT NULL,
  author_avatar TEXT,
  destination   TEXT,
  quote         TEXT        NOT NULL,
  rating        INT         NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  is_featured   BOOLEAN     NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- BOOKING REQUESTS
-- ─────────────────────────────────────────────────────────────
CREATE TYPE booking_status AS ENUM ('pending', 'contacted', 'confirmed', 'cancelled');

CREATE TABLE booking_requests (
  id             UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id     UUID           REFERENCES travel_packages(id) ON DELETE SET NULL,
  name           TEXT           NOT NULL,
  email          TEXT           NOT NULL,
  phone          TEXT,
  check_in_date  DATE,
  pax_count      INT            NOT NULL DEFAULT 2,
  message        TEXT,
  status         booking_status NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMPTZ    DEFAULT NOW(),
  updated_at     TIMESTAMPTZ    DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────
CREATE INDEX idx_packages_published   ON travel_packages(is_published);
CREATE INDEX idx_packages_featured    ON travel_packages(is_featured);
CREATE INDEX idx_packages_slug        ON travel_packages(slug);
CREATE INDEX idx_packages_category    ON travel_packages(category_id);
CREATE INDEX idx_packages_destination ON travel_packages(destination_id);
CREATE INDEX idx_images_package       ON package_images(package_id);
CREATE INDEX idx_itinerary_package    ON package_itinerary(package_id, sort_order);
CREATE INDEX idx_bookings_status      ON booking_requests(status);
CREATE INDEX idx_bookings_created     ON booking_requests(created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_destinations_updated_at
  BEFORE UPDATE ON destinations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_packages_updated_at
  BEFORE UPDATE ON travel_packages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON booking_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────
ALTER TABLE categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_packages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_images    ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_itinerary ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials      ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests  ENABLE ROW LEVEL SECURITY;

-- Public can read published packages and all lookup tables
CREATE POLICY "public_read_categories"
  ON categories FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "public_read_destinations"
  ON destinations FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "public_read_published_packages"
  ON travel_packages FOR SELECT TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "public_read_package_images"
  ON package_images FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "public_read_package_itinerary"
  ON package_itinerary FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "public_read_featured_testimonials"
  ON testimonials FOR SELECT TO anon, authenticated
  USING (true);

-- Anyone can submit a booking request
CREATE POLICY "public_insert_bookings"
  ON booking_requests FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Authenticated users (admin) have full access to everything
CREATE POLICY "admin_all_categories"
  ON categories FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_destinations"
  ON destinations FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_packages"
  ON travel_packages FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_images"
  ON package_images FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_itinerary"
  ON package_itinerary FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_testimonials"
  ON testimonials FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_bookings"
  ON booking_requests FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- STORAGE BUCKETS
-- ─────────────────────────────────────────────────────────────
-- Executar separadamente no Dashboard > Storage > New Bucket:
--
--   Bucket name: package-images
--   Public: true
--
-- Ou via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('package-images', 'package-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public_read_package_images_storage"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'package-images');

CREATE POLICY "admin_upload_package_images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'package-images');

CREATE POLICY "admin_delete_package_images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'package-images');