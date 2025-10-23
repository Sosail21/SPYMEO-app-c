export interface Document {
  id: string;
  title: string;
  type: string;
  url?: string;
  uploadedAt: string;
  size?: number;
  createdAt?: string;
  practitionerSlug?: string;
  practitionerName?: string;
  relatedAppointmentId?: string;
}

export type UserDocument = Document;
