export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          trip_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          trip_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          trip_count?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      destinations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          country: string;
          description: string | null;
          image_url: string;
          trip_count: number;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          country: string;
          description?: string | null;
          image_url: string;
          trip_count?: number;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          country?: string;
          description?: string | null;
          image_url?: string;
          trip_count?: number;
          is_featured?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      travel_packages: {
        Row: {
          id: string;
          slug: string;
          title: string;
          short_description: string | null;
          long_description: string | null;
          country: string;
          destination_id: string | null;
          category_id: string | null;
          duration_days: number;
          nights: number;
          price_from: number;
          rating: number;
          review_count: number;
          hero_image_url: string | null;
          tag: string | null;
          departure_date: string | null;
          return_date: string | null;
          available_seats: number | null;
          trip_status: string | null;
          pdf_url: string | null;
          is_featured: boolean;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          short_description?: string | null;
          long_description?: string | null;
          country: string;
          destination_id?: string | null;
          category_id?: string | null;
          duration_days: number;
          nights: number;
          price_from: number;
          rating?: number;
          review_count?: number;
          hero_image_url?: string | null;
          tag?: string | null;
          departure_date?: string | null;
          return_date?: string | null;
          available_seats?: number | null;
          trip_status?: string | null;
          pdf_url?: string | null;
          is_featured?: boolean;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          short_description?: string | null;
          long_description?: string | null;
          country?: string;
          destination_id?: string | null;
          category_id?: string | null;
          duration_days?: number;
          nights?: number;
          price_from?: number;
          rating?: number;
          review_count?: number;
          hero_image_url?: string | null;
          tag?: string | null;
          departure_date?: string | null;
          return_date?: string | null;
          available_seats?: number | null;
          trip_status?: string | null;
          pdf_url?: string | null;
          is_featured?: boolean;
          is_published?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "travel_packages_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "travel_packages_destination_id_fkey";
            columns: ["destination_id"];
            isOneToOne: false;
            referencedRelation: "destinations";
            referencedColumns: ["id"];
          }
        ];
      };
      package_images: {
        Row: {
          id: string;
          package_id: string;
          image_url: string;
          alt_text: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          package_id: string;
          image_url: string;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          package_id?: string;
          image_url?: string;
          alt_text?: string | null;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "package_images_package_id_fkey";
            columns: ["package_id"];
            isOneToOne: false;
            referencedRelation: "travel_packages";
            referencedColumns: ["id"];
          }
        ];
      };
      package_itinerary: {
        Row: {
          id: string;
          package_id: string;
          day_label: string;
          title: string;
          description: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          package_id: string;
          day_label: string;
          title: string;
          description: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          package_id?: string;
          day_label?: string;
          title?: string;
          description?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "package_itinerary_package_id_fkey";
            columns: ["package_id"];
            isOneToOne: false;
            referencedRelation: "travel_packages";
            referencedColumns: ["id"];
          }
        ];
      };
      testimonials: {
        Row: {
          id: string;
          package_id: string | null;
          author_name: string;
          author_avatar: string | null;
          destination: string | null;
          quote: string;
          rating: number;
          is_featured: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          package_id?: string | null;
          author_name: string;
          author_avatar?: string | null;
          destination?: string | null;
          quote: string;
          rating?: number;
          is_featured?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          package_id?: string | null;
          author_name?: string;
          author_avatar?: string | null;
          destination?: string | null;
          quote?: string;
          rating?: number;
          is_featured?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "testimonials_package_id_fkey";
            columns: ["package_id"];
            isOneToOne: false;
            referencedRelation: "travel_packages";
            referencedColumns: ["id"];
          }
        ];
      };
      trip_groups: {
        Row: { id: string; title: string; destination: string; start_date: string; end_date: string; price_per_person: number; notes: string | null; package_id: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; title: string; destination: string; start_date: string; end_date: string; price_per_person: number; notes?: string | null; package_id?: string | null };
        Update: { title?: string; destination?: string; start_date?: string; end_date?: string; price_per_person?: number; notes?: string | null; package_id?: string | null; updated_at?: string };
        Relationships: [{ foreignKeyName: "trip_groups_package_id_fkey"; columns: ["package_id"]; isOneToOne: false; referencedRelation: "travel_packages"; referencedColumns: ["id"] }];
      };
      trip_passengers: {
        Row: { id: string; trip_id: string; full_name: string; id_card_number: string | null; id_card_expiry: string | null; nif: string | null; date_of_birth: string | null; nationality: string | null; phone: string | null; email: string | null; notes: string | null; sort_order: number; created_at: string; updated_at: string };
        Insert: { id?: string; trip_id: string; full_name: string; id_card_number?: string | null; id_card_expiry?: string | null; nif?: string | null; date_of_birth?: string | null; nationality?: string | null; phone?: string | null; email?: string | null; notes?: string | null; sort_order?: number };
        Update: { full_name?: string; id_card_number?: string | null; id_card_expiry?: string | null; nif?: string | null; date_of_birth?: string | null; nationality?: string | null; phone?: string | null; email?: string | null; notes?: string | null; sort_order?: number; updated_at?: string };
        Relationships: [{ foreignKeyName: "trip_passengers_trip_id_fkey"; columns: ["trip_id"]; isOneToOne: false; referencedRelation: "trip_groups"; referencedColumns: ["id"] }];
      };
      trip_payments: {
        Row: { id: string; passenger_id: string; amount: number; payment_date: string; method: string; notes: string | null; created_at: string };
        Insert: { id?: string; passenger_id: string; amount: number; payment_date: string; method: string; notes?: string | null };
        Update: { amount?: number; payment_date?: string; method?: string; notes?: string | null };
        Relationships: [{ foreignKeyName: "trip_payments_passenger_id_fkey"; columns: ["passenger_id"]; isOneToOne: false; referencedRelation: "trip_passengers"; referencedColumns: ["id"] }];
      };
      user_profiles: {
        Row: {
          id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          country: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          country?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          country?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      contact_requests: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          type: string;
          subject: string | null;
          message: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          type?: string;
          subject?: string | null;
          message: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          type?: string;
          subject?: string | null;
          message?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      booking_requests: {
        Row: {
          id: string;
          package_id: string | null;
          name: string;
          email: string;
          phone: string | null;
          check_in_date: string | null;
          pax_count: number;
          message: string | null;
          status: "pending" | "contacted" | "confirmed" | "cancelled";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          package_id?: string | null;
          name: string;
          email: string;
          phone?: string | null;
          check_in_date?: string | null;
          pax_count?: number;
          message?: string | null;
          status?: "pending" | "contacted" | "confirmed" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          package_id?: string | null;
          name?: string;
          email?: string;
          phone?: string | null;
          check_in_date?: string | null;
          pax_count?: number;
          message?: string | null;
          status?: "pending" | "contacted" | "confirmed" | "cancelled";
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booking_requests_package_id_fkey";
            columns: ["package_id"];
            isOneToOne: false;
            referencedRelation: "travel_packages";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      booking_status: "pending" | "contacted" | "confirmed" | "cancelled";
    };
  };
}

// Convenience row types
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Destination = Database["public"]["Tables"]["destinations"]["Row"];
export type TravelPackage = Database["public"]["Tables"]["travel_packages"]["Row"];
export type PackageImage = Database["public"]["Tables"]["package_images"]["Row"];
export type PackageItinerary = Database["public"]["Tables"]["package_itinerary"]["Row"];
export type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];
export type BookingRequest = Database["public"]["Tables"]["booking_requests"]["Row"];

// Extended types with joined relations
export type TravelPackageWithRelations = TravelPackage & {
  category: Pick<Category, "id" | "name" | "slug"> | null;
  destination: Pick<Destination, "id" | "name" | "slug"> | null;
  images: PackageImage[];
  itinerary: PackageItinerary[];
};

export type TravelPackageCard = TravelPackage & {
  category: Pick<Category, "id" | "name" | "slug"> | null;
};