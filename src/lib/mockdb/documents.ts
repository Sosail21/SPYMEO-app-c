// Documents partagés par les pros (lecture seule côté user)

export type UserDocument = {
  id: string;
  title: string;
  type: "Bilan" | "Ordonnance" | "Conseils" | "Ressource";
  createdAt: string; // ISO
  practitionerName: string;
  practitionerSlug: string;
  relatedAppointmentId?: string;
  downloadUrl?: string; // placeholder
};

export const MOCK_USER_DOCUMENTS: UserDocument[] = [
  {
    id: "doc-001",
    title: "Conseils post-séance — sophrologie",
    type: "Conseils",
    createdAt: "2025-08-28T16:10:00Z",
    practitionerName: "Nicolas Perrin",
    practitionerSlug: "nicolas-perrin",
    relatedAppointmentId: "a-2025-08-28-14h",
    downloadUrl: "/api/user/documents/doc-001", // placeholder
  },
  {
    id: "doc-002",
    title: "Bilan — naturopathie",
    type: "Bilan",
    createdAt: "2025-07-15T11:00:00Z",
    practitionerName: "Aline Dupont",
    practitionerSlug: "aline-dupont",
  },
];

export function getUserDocumentById(id: string) {
  return MOCK_USER_DOCUMENTS.find((d) => d.id === id) || null;
}
