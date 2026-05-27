export interface Trip {
  id: string;
  slug: string;
  title: string;
  country: string;
  duration: number;
  nights: number;
  price: number;
  rating: number;
  reviews: number;
  category: TripCategory;
  tag: string;
  short: string;
  hero: string;
  gallery: string[];
  itinerary: ItineraryItem[];
}

export interface ItineraryItem {
  d: string;
  t: string;
  b: string;
}

export type TripCategory =
  | "Mediterranean"
  | "Cultural"
  | "Beach"
  | "Adventure"
  | "Wellness"
  | "All";

export interface Destination {
  name: string;
  count: number;
  img: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  where: string;
  avatar: string;
}

export interface Category {
  name: string;
  count: number;
}