export interface UserPractitioner {
  id: string;
  name: string;
  specialty?: string;
  specialties?: string[];
  city?: string;
  photo?: string;
  nextAppointment?: string;
  lastVisitAt?: string;
  nextAvailable?: string;
  slug?: string;
}
