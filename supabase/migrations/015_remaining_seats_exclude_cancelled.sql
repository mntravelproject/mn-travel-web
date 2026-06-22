-- Corrigir get_remaining_seats: contar todos os booking_requests EXCEPTO cancelados
-- (pending, contacted, confirmed contam para lugares ocupados)

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

  -- Todos os pedidos de reserva não cancelados
  SELECT COALESCE(SUM(pax_count), 0) INTO v_bookings
  FROM booking_requests
  WHERE package_id = package_uuid AND status != 'cancelled';

  -- Passageiros adicionados via admin (trip_groups ligados a este package)
  SELECT COUNT(*) INTO v_passengers
  FROM trip_passengers tp
  INNER JOIN trip_groups tg ON tp.trip_id = tg.id
  WHERE tg.package_id = package_uuid;

  RETURN GREATEST(0, v_total - v_bookings - v_passengers);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_remaining_seats(UUID) TO anon, authenticated;
