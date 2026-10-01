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
  /** Null only once the reservation has been anonymised (2 years after its date). */
  phone: string | null;
  /** Null on requests made before guests gave an email address, and after anonymisation. */
  email: string | null;
  reservation_date: string;
  reservation_time: string;
  guests: number;
  special_requests: string | null;
  status: ReservationStatus;
  created_at: string;
  admin_response: string | null;
  responded_at: string | null;
  responded_by: string | null;
  terms_accepted_at: string | null;
  /** Opt-ins ticked in the booking form. Offers by email only count once confirmed. */
  marketing_email: boolean;
  marketing_sms: boolean;
  /** Double opt-in: when the guest confirmed offers by email via the emailed link. */
  marketing_email_confirmed_at: string | null;
  /** Language the guest booked in; their emails use it. */
  locale: "de" | "en";
  /** When the team's answer was emailed to the guest. */
  response_emailed_at: string | null;
  /** Set when the nightly retention job removed the personal data. */
  anonymized_at: string | null;
};

export type Role = "owner" | "admin";
export type Permission = "menu.manage" | "reservations.manage";

export type Profile = { full_name: string | null; created_at: string };

