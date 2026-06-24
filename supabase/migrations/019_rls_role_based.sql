-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 019 — RLS role-based policies
-- Run this in the Supabase SQL editor.
-- ─────────────────────────────────────────────────────────────────────────────

-- Helper function: returns the role of the current authenticated user.
-- SECURITY DEFINER bypasses RLS on user_profiles to avoid circular dependency.
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(role, 'staff')
  FROM public.user_profiles
  WHERE id = auth.uid();
$$;

-- ─── Enable RLS on every table that holds sensitive data ─────────────────────

ALTER TABLE public.booking_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_groups       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_passengers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_payments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_expenses     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_packages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_dates     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_images    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_itinerary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials      ENABLE ROW LEVEL SECURITY;

-- ─── Drop all existing policies (safe to re-run) ─────────────────────────────

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
      r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- ─── PUBLIC READ — catálogo, datas, imagens, itinerário, categorias ───────────

CREATE POLICY "anon_read_published_packages" ON public.travel_packages
  FOR SELECT TO anon USING (is_published = true);

CREATE POLICY "anon_read_categories" ON public.categories
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_read_destinations" ON public.destinations
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_read_package_dates" ON public.package_dates
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_read_package_images" ON public.package_images
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_read_package_itinerary" ON public.package_itinerary
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_read_testimonials" ON public.testimonials
  FOR SELECT TO anon USING (is_featured = true);

-- ─── PUBLIC INSERT — formulários públicos ────────────────────────────────────

CREATE POLICY "anon_insert_booking" ON public.booking_requests
  FOR INSERT TO anon WITH CHECK (
    name IS NOT NULL AND name <> '' AND
    email IS NOT NULL AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND
    pax_count BETWEEN 1 AND 50
  );

CREATE POLICY "anon_insert_contact" ON public.contact_requests
  FOR INSERT TO anon WITH CHECK (
    name IS NOT NULL AND name <> '' AND
    email IS NOT NULL AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND
    message IS NOT NULL AND message <> ''
  );

-- ─── STAFF + ADMIN — acesso total às tabelas operacionais ────────────────────

-- travel_packages (staff/admin vê todos, incluindo não publicados)
CREATE POLICY "staff_read_all_packages" ON public.travel_packages
  FOR SELECT TO authenticated
  USING (public.current_user_role() IN ('admin', 'staff'));

CREATE POLICY "staff_write_packages" ON public.travel_packages
  FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() IN ('admin', 'staff'));

CREATE POLICY "staff_update_packages" ON public.travel_packages
  FOR UPDATE TO authenticated
  USING (public.current_user_role() IN ('admin', 'staff'))
  WITH CHECK (public.current_user_role() IN ('admin', 'staff'));

CREATE POLICY "admin_delete_packages" ON public.travel_packages
  FOR DELETE TO authenticated
  USING (public.current_user_role() = 'admin');

-- package_dates
CREATE POLICY "staff_all_package_dates" ON public.package_dates
  FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin', 'staff'))
  WITH CHECK (public.current_user_role() IN ('admin', 'staff'));

-- package_images
CREATE POLICY "staff_all_package_images" ON public.package_images
  FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin', 'staff'))
  WITH CHECK (public.current_user_role() IN ('admin', 'staff'));

-- package_itinerary
CREATE POLICY "staff_all_package_itinerary" ON public.package_itinerary
  FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin', 'staff'))
  WITH CHECK (public.current_user_role() IN ('admin', 'staff'));

-- categories + destinations (staff pode ler/escrever)
CREATE POLICY "staff_all_categories" ON public.categories
  FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin', 'staff'))
  WITH CHECK (public.current_user_role() IN ('admin', 'staff'));

CREATE POLICY "staff_all_destinations" ON public.destinations
  FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin', 'staff'))
  WITH CHECK (public.current_user_role() IN ('admin', 'staff'));

CREATE POLICY "staff_all_testimonials" ON public.testimonials
  FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin', 'staff'))
  WITH CHECK (public.current_user_role() IN ('admin', 'staff'));

-- booking_requests
CREATE POLICY "auth_insert_booking" ON public.booking_requests
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "staff_read_bookings" ON public.booking_requests
  FOR SELECT TO authenticated
  USING (public.current_user_role() IN ('admin', 'staff'));

CREATE POLICY "staff_update_bookings" ON public.booking_requests
  FOR UPDATE TO authenticated
  USING (public.current_user_role() IN ('admin', 'staff'))
  WITH CHECK (public.current_user_role() IN ('admin', 'staff'));

CREATE POLICY "admin_delete_bookings" ON public.booking_requests
  FOR DELETE TO authenticated
  USING (public.current_user_role() = 'admin');

-- contact_requests
CREATE POLICY "auth_insert_contact" ON public.contact_requests
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "staff_read_contacts" ON public.contact_requests
  FOR SELECT TO authenticated
  USING (public.current_user_role() IN ('admin', 'staff'));

CREATE POLICY "staff_update_contacts" ON public.contact_requests
  FOR UPDATE TO authenticated
  USING (public.current_user_role() IN ('admin', 'staff'))
  WITH CHECK (public.current_user_role() IN ('admin', 'staff'));

CREATE POLICY "admin_delete_contacts" ON public.contact_requests
  FOR DELETE TO authenticated
  USING (public.current_user_role() = 'admin');

-- clients
CREATE POLICY "staff_all_clients" ON public.clients
  FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin', 'staff'))
  WITH CHECK (public.current_user_role() IN ('admin', 'staff'));

-- trip_groups
CREATE POLICY "staff_read_trip_groups" ON public.trip_groups
  FOR SELECT TO authenticated
  USING (public.current_user_role() IN ('admin', 'staff'));

CREATE POLICY "staff_write_trip_groups" ON public.trip_groups
  FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() IN ('admin', 'staff'));

CREATE POLICY "staff_update_trip_groups" ON public.trip_groups
  FOR UPDATE TO authenticated
  USING (public.current_user_role() IN ('admin', 'staff'))
  WITH CHECK (public.current_user_role() IN ('admin', 'staff'));

CREATE POLICY "admin_delete_trip_groups" ON public.trip_groups
  FOR DELETE TO authenticated
  USING (public.current_user_role() = 'admin');

-- trip_passengers
CREATE POLICY "staff_all_trip_passengers" ON public.trip_passengers
  FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin', 'staff'))
  WITH CHECK (public.current_user_role() IN ('admin', 'staff'));

-- trip_payments
CREATE POLICY "staff_all_trip_payments" ON public.trip_payments
  FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin', 'staff'))
  WITH CHECK (public.current_user_role() IN ('admin', 'staff'));

-- trip_expenses
CREATE POLICY "staff_all_trip_expenses" ON public.trip_expenses
  FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin', 'staff'))
  WITH CHECK (public.current_user_role() IN ('admin', 'staff'));

-- ─── USER PROFILES — cada utilizador lê o seu próprio; admin gere tudo ────────

-- Cada utilizador pode ler o seu próprio perfil (necessário para o painel admin)
CREATE POLICY "read_own_profile" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Admin pode gerir todos os perfis
CREATE POLICY "admin_all_profiles" ON public.user_profiles
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');
