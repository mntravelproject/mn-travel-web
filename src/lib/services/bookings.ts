import { createClient } from "@/lib/supabase/server";
import type { BookingRequest } from "@/types/database";

export interface BookingInput {
  package_id?: string;
  name: string;
  email: string;
  phone?: string;
  check_in_date?: string;
  pax_count?: number;
  message?: string;
}

export async function createBookingRequest(input: BookingInput): Promise<BookingRequest> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("booking_requests")
    .insert({
      ...input,
      pax_count: input.pax_count ?? 2,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw new Error(`createBookingRequest: ${error.message}`);
  return data;
}

export async function getAllBookings(): Promise<BookingRequest[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("booking_requests")
    .select(`
      *,
      package:travel_packages(id, title, slug)
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`getAllBookings: ${error.message}`);
  return (data ?? []) as BookingRequest[];
}

export async function updateBookingStatus(
  id: string,
  status: BookingRequest["status"]
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("booking_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(`updateBookingStatus: ${error.message}`);
}