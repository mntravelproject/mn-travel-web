-- ============================================================
-- Função para calcular lugares restantes de um travel_package
-- SECURITY DEFINER: bypassa RLS, pode ser chamada pelo client anon
-- ============================================================

CREATE OR REPLACE FUNCTION get_remaining_seats(package_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  v_total      INTEGER;
  v_bookings   INTEGER;
  v_passengers INTEGER;
BEGIN
  SELECT available_seats INTO v_total
  FROM travel_packages
  WHERE id = package_uuid;

  IF v_total IS NULL THEN
    RETURN NULL;
  END IF;

  -- Reservas confirmadas do site público
  SELECT COALESCE(SUM(pax_count), 0) INTO v_bookings
  FROM booking_requests
  WHERE package_id = package_uuid AND status = 'confirmed';

  -- Passageiros adicionados via admin (trip_groups ligados a este package)
  SELECT COUNT(*) INTO v_passengers
  FROM trip_passengers tp
  INNER JOIN trip_groups tg ON tp.trip_id = tg.id
  WHERE tg.package_id = package_uuid;

  RETURN GREATEST(0, v_total - v_bookings - v_passengers);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permite chamada pelo client público (anon) e autenticado
GRANT EXECUTE ON FUNCTION get_remaining_seats(UUID) TO anon, authenticated;
