export type ProRole = "PRACTITIONER" | "ARTISAN" | "COMMERÇANT" | "CENTER" | "ADMIN";

export type ProContact = {
  id: string;
  name: string;
  role: ProRole;
  specialty?: string;
  company?: string;
  city?: string;
  phone?: string;
  email?: string;
  slug?: string;
};
