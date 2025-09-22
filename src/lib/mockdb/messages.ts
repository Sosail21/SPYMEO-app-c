// Messagerie (utilisateurs ↔ pros)

export type Conversation = {
  id: string;
  practitionerName: string;
  practitionerSlug: string;
  lastMessageAt: string; // ISO
  unreadCount?: number;
};

export type Message = {
  id: string;
  conversationId: string;
  author: "user" | "pro" | "system";
  text: string;
  at: string; // ISO
};

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "c-aline-dupont",
    practitionerName: "Aline Dupont",
    practitionerSlug: "aline-dupont",
    lastMessageAt: "2025-09-20T08:40:00Z",
    unreadCount: 1,
  },
  {
    id: "c-nicolas-perrin",
    practitionerName: "Nicolas Perrin",
    practitionerSlug: "nicolas-perrin",
    lastMessageAt: "2025-09-19T17:05:00Z",
  },
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: "m1",
    conversationId: "c-aline-dupont",
    author: "pro",
    text: "Bonjour, je vous envoie le questionnaire d’amont.",
    at: "2025-09-20T08:40:00Z",
  },
  {
    id: "m2",
    conversationId: "c-aline-dupont",
    author: "user",
    text: "Merci, je le remplis aujourd’hui.",
    at: "2025-09-20T09:02:00Z",
  },
  {
    id: "m3",
    conversationId: "c-nicolas-perrin",
    author: "system",
    text: "Votre rendez-vous du 28/08 est passé.",
    at: "2025-08-28T15:30:00Z",
  },
];

export function getConversationById(id: string) {
  return MOCK_CONVERSATIONS.find((c) => c.id === id) || null;
}
export function getMessagesForConversation(id: string) {
  return MOCK_MESSAGES.filter((m) => m.conversationId === id).sort((a, b) => a.at.localeCompare(b.at));
}
