export const COOKIE_NAME = "spymeo_session";

export type Session = {
  id: string;
  name: string;
  email: string;
  role:
    | "FREE_USER"
    | "PASS_USER"
    | "PRACTITIONER"
    | "ARTISAN"
    | "COMMERÇANT"
    | "CENTER"
    | "ADMIN";
};
