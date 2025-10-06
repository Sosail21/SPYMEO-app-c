import { z } from 'zod';

// Client validation schemas
export const createClientSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email format').optional().nullable(),
  phone: z.string().optional().nullable(),
  birthDate: z.string().datetime().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
});

export const updateClientSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email('Invalid email format').optional().nullable(),
  phone: z.string().optional().nullable(),
  birthDate: z.string().datetime().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

export const clientSearchSchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

// Consultation validation schemas
export const createConsultationSchema = z.object({
  clientId: z.string().cuid(),
  date: z.string().datetime(),
  duration: z.number().int().positive().optional().nullable(),
  type: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  recommendations: z.string().optional().nullable(),
  nextSteps: z.string().optional().nullable(),
});

export const updateConsultationSchema = z.object({
  date: z.string().datetime().optional(),
  duration: z.number().int().positive().optional().nullable(),
  type: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  recommendations: z.string().optional().nullable(),
  nextSteps: z.string().optional().nullable(),
});

// Antecedent validation schemas
export const createAntecedentSchema = z.object({
  clientId: z.string().cuid(),
  category: z.string().min(1, 'Category is required'),
  label: z.string().min(1, 'Label is required'),
  details: z.string().optional().nullable(),
  date: z.string().datetime().optional().nullable(),
});

export const updateAntecedentSchema = z.object({
  category: z.string().min(1).optional(),
  label: z.string().min(1).optional(),
  details: z.string().optional().nullable(),
  date: z.string().datetime().optional().nullable(),
});

// ClientDocument validation schemas
export const createClientDocumentSchema = z.object({
  clientId: z.string().cuid(),
  title: z.string().min(1, 'Title is required'),
  fileName: z.string().min(1, 'File name is required'),
  fileUrl: z.string().url('Invalid file URL'),
  fileType: z.string().optional().nullable(),
  fileSize: z.number().int().positive().optional().nullable(),
});

// Invoice validation schemas
export const createInvoiceSchema = z.object({
  clientId: z.string().cuid(),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  date: z.string().datetime(),
  dueDate: z.string().datetime().optional().nullable(),
  items: z.array(
    z.object({
      description: z.string(),
      quantity: z.number().positive(),
      unitPrice: z.number().nonnegative(),
      total: z.number().nonnegative(),
    })
  ),
  subtotal: z.number().nonnegative(),
  vatRate: z.number().nonnegative().default(0),
  vatAmount: z.number().nonnegative().default(0),
  total: z.number().nonnegative(),
  paid: z.boolean().default(false),
  paidAt: z.string().datetime().optional().nullable(),
  paymentMethod: z.enum(['CARD', 'CASH', 'CHECK', 'BANK_TRANSFER', 'OTHER']).optional().nullable(),
  notes: z.string().optional().nullable(),
});

// Type exports
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type ClientSearchInput = z.infer<typeof clientSearchSchema>;
export type CreateConsultationInput = z.infer<typeof createConsultationSchema>;
export type UpdateConsultationInput = z.infer<typeof updateConsultationSchema>;
export type CreateAntecedentInput = z.infer<typeof createAntecedentSchema>;
export type UpdateAntecedentInput = z.infer<typeof updateAntecedentSchema>;
export type CreateClientDocumentInput = z.infer<typeof createClientDocumentSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
