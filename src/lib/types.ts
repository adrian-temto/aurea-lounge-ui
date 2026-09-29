export type MenuCategory = {
  id: number;
  name: string;
  sort_order: number;
  /** Set for subcategories; the menu is one level deep. */
  parent_id: number | null;
  is_published: boolean;
  /** English name; null shows the German one on the English site. */
  name_en: string | null;
};

export type MenuItem = {
  id: number;
  category_id: number;
  name: string;
  description: string;
  /** English texts; null shows the German ones on the English site. */
  name_en: string | null;
  description_en: string | null;
  price: number;
  tag: "V" | "VG" | null;
  /** Published: shown on the website. */
  is_visible: boolean;
  /** Published but temporarily sold out when false. */
  is_available: boolean;
  /** Keys from ALLERGENS in lib/menu.ts. */
  allergens: string[];
  /** Path inside the menu-images bucket. */
  image_path: string | null;
  sort_order: number;
};

export type ReservationStatus = "new" | "confirmed" | "declined" | "cancelled";

export type Reservation = {
  id: number;
  name: string;
  phone: string;
  reservation_date: string;
  reservation_time: string;
  guests: number;
  special_requests: string | null;
  status: ReservationStatus;
  created_at: string;
  /** Set when the guest was signed in while booking; they can then read the response in /account. */
  user_id: string | null;
  admin_response: string | null;
  responded_at: string | null;
  responded_by: string | null;
};

export type Role = "admin" | "staff";
export type Permission = "menu.manage" | "reservations.manage";

export type Profile = { full_name: string | null; created_at: string };

/** Where the header's account link points. `href` is unlocalized; the dashboard is German-only. */
export type AccountLink = { href: string; kind: "join" | "account" | "dashboard" };
