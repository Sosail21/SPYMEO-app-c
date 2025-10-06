import type { Session } from '@/lib/auth/session';

export type TestUser = Session & {
  password: string;
};

export const testUsers: TestUser[] = [
  {
    id: 'user-admin-1',
    name: 'Admin User',
    email: 'admin@spymeo.com',
    password: 'admin123',
    role: 'ADMIN',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User',
  },
  {
    id: 'user-practitioner-1',
    name: 'Dr. Marie Dubois',
    email: 'marie.dubois@spymeo.com',
    password: 'practitioner123',
    role: 'PRACTITIONER',
    avatar: 'https://ui-avatars.com/api/?name=Marie+Dubois',
  },
  {
    id: 'user-practitioner-2',
    name: 'Dr. Pierre Martin',
    email: 'pierre.martin@spymeo.com',
    password: 'practitioner123',
    role: 'PRACTITIONER',
    avatar: 'https://ui-avatars.com/api/?name=Pierre+Martin',
  },
  {
    id: 'user-artisan-1',
    name: 'Jean Artisan',
    email: 'jean.artisan@spymeo.com',
    password: 'artisan123',
    role: 'ARTISAN',
    avatar: 'https://ui-avatars.com/api/?name=Jean+Artisan',
  },
  {
    id: 'user-commercant-1',
    name: 'Sophie Commercant',
    email: 'sophie.commercant@spymeo.com',
    password: 'commercant123',
    role: 'COMMERCANT',
    avatar: 'https://ui-avatars.com/api/?name=Sophie+Commercant',
  },
  {
    id: 'user-center-1',
    name: 'Centre Formation Pro',
    email: 'centre@spymeo.com',
    password: 'center123',
    role: 'CENTER',
    avatar: 'https://ui-avatars.com/api/?name=Centre+Formation',
  },
  {
    id: 'user-pass-1',
    name: 'Alice Pass',
    email: 'alice.pass@spymeo.com',
    password: 'pass123',
    role: 'PASS_USER',
    avatar: 'https://ui-avatars.com/api/?name=Alice+Pass',
  },
  {
    id: 'user-free-1',
    name: 'Bob Free',
    email: 'bob.free@spymeo.com',
    password: 'free123',
    role: 'FREE_USER',
    avatar: 'https://ui-avatars.com/api/?name=Bob+Free',
  },
];

// Helper functions to get specific user types
export const getAdminUser = () => testUsers.find((u) => u.role === 'ADMIN')!;
export const getPractitionerUser = () => testUsers.find((u) => u.role === 'PRACTITIONER')!;
export const getArtisanUser = () => testUsers.find((u) => u.role === 'ARTISAN')!;
export const getCommercantUser = () => testUsers.find((u) => u.role === 'COMMERCANT')!;
export const getCenterUser = () => testUsers.find((u) => u.role === 'CENTER')!;
export const getPassUser = () => testUsers.find((u) => u.role === 'PASS_USER')!;
export const getFreeUser = () => testUsers.find((u) => u.role === 'FREE_USER')!;
