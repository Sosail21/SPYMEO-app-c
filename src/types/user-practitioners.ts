export interface UserPractitioner {
  id: string;
  name: string;
  specialty?: string;
  specialties?: string[];
  city?: string;
  nextAppointment?: string;
  lastVisitAt?: string;
  nextAvailable?: string;
  slug?: string;
}
