// Cdw-Spm
export type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate?: string;
  address?: string;
  notes?: string;
};

export type Patient = {
  id: string;
  name: string;
  birthdate?: string;
  email?: string;
  phone?: string;
};