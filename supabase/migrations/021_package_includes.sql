-- Migration 021 — package_includes table
-- Items included in a travel package (e.g. flights, hotels, transfers)

CREATE TABLE IF NOT EXISTS public.package_includes (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id  UUID    NOT NULL REFERENCES public.travel_packages(id) ON DELETE CASCADE,
  title       TEXT    NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.package_includes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_package_includes" ON public.package_includes
  FOR SELECT TO anon USING (true);

CREATE POLICY "staff_all_package_includes" ON public.package_includes
  FOR ALL TO authenticated
  USING  (public.current_user_role() IN ('admin', 'staff'))
  WITH CHECK (public.current_user_role() IN ('admin', 'staff'));
