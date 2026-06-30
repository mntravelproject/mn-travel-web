-- Data de fim (check-out) nos pedidos de reserva
ALTER TABLE booking_requests
  ADD COLUMN IF NOT EXISTS check_out_date DATE;
