export type User = {
  id: string;
  name: string;
  avatar?: string; // emoji or URL
  role?: 'PASS' | 'PRACTITIONER' | 'ARTISAN' | 'COMMERÇANT' | 'CENTER' | 'ADMIN';
};

export type Conversation = {
  id: string;
  with: User;               // the other participant (for 1‑to‑1)
  lastMessage: string;
  lastAt: string;
  unread?: number;
  pinned?: boolean;
};

export type ChatMessage = {
  id: string;
  from: User['id'];
  to: User['id'];
  text?: string;
  imageUrl?: string;
  createdAt: string;
  read?: boolean;
};
