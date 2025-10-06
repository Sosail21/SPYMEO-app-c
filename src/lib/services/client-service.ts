import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  createClientSchema,
  updateClientSchema,
  clientSearchSchema,
  type CreateClientInput,
  type UpdateClientInput,
  type ClientSearchInput,
} from '@/lib/validation/client';

/**
 * Create a new client for a practitioner
 */
export async function createClient(
  practitionerId: string,
  data: CreateClientInput
) {
  // Validate input
  const validated = createClientSchema.parse(data);

  // Verify practitioner exists
  const practitioner = await prisma.user.findUnique({
    where: { id: practitionerId },
  });

  if (!practitioner) {
    throw new Error('Practitioner not found');
  }

  // Trim names
  const clientData: Prisma.ClientCreateInput = {
    practitioner: { connect: { id: practitionerId } },
    firstName: validated.firstName.trim(),
    lastName: validated.lastName.trim(),
    email: validated.email || null,
    phone: validated.phone || null,
    birthDate: validated.birthDate ? new Date(validated.birthDate) : null,
    address: validated.address || null,
    city: validated.city || null,
    postalCode: validated.postalCode || null,
    notes: validated.notes || null,
    tags: validated.tags || [],
  };

  const client = await prisma.client.create({
    data: clientData,
  });

  return client;
}

/**
 * Get a client by ID
 * Includes authorization check unless bypassAuth is true
 */
export async function getClient(
  clientId: string,
  practitionerId: string,
  options?: { bypassAuth?: boolean; include?: Prisma.ClientInclude }
) {
  const where: Prisma.ClientWhereInput = {
    id: clientId,
  };

  // Add authorization check unless bypassed
  if (!options?.bypassAuth) {
    where.practitionerId = practitionerId;
  }

  const client = await prisma.client.findFirst({
    where,
    include: options?.include,
  });

  return client;
}

/**
 * List all clients for a practitioner
 */
export async function listClients(
  practitionerId: string,
  options?: { include?: Prisma.ClientInclude }
) {
  const clients = await prisma.client.findMany({
    where: { practitionerId },
    include: options?.include,
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  });

  return clients;
}

/**
 * Search clients with filters and pagination
 */
export async function searchClients(
  practitionerId: string,
  params: ClientSearchInput
) {
  const validated = clientSearchSchema.parse(params);
  const { q, page = 1, limit = 50 } = validated;

  const where: Prisma.ClientWhereInput = {
    practitionerId,
  };

  // Add search filter if query provided
  if (q && q.trim()) {
    where.OR = [
      { firstName: { contains: q, mode: 'insensitive' } },
      { lastName: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q, mode: 'insensitive' } },
      { city: { contains: q, mode: 'insensitive' } },
      { address: { contains: q, mode: 'insensitive' } },
    ];
  }

  const clients = await prisma.client.findMany({
    where,
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    skip: (page - 1) * limit,
    take: limit,
  });

  return clients;
}

/**
 * Update a client
 */
export async function updateClient(
  clientId: string,
  practitionerId: string,
  data: UpdateClientInput,
  options?: { bypassAuth?: boolean }
) {
  // Validate input
  const validated = updateClientSchema.parse(data);

  // Check authorization
  const existing = await getClient(clientId, practitionerId, {
    bypassAuth: options?.bypassAuth,
  });

  if (!existing) {
    return null;
  }

  // Prepare update data
  const updateData: Prisma.ClientUpdateInput = {};

  if (validated.firstName !== undefined) {
    updateData.firstName = validated.firstName.trim();
  }
  if (validated.lastName !== undefined) {
    updateData.lastName = validated.lastName.trim();
  }
  if (validated.email !== undefined) {
    updateData.email = validated.email;
  }
  if (validated.phone !== undefined) {
    updateData.phone = validated.phone;
  }
  if (validated.birthDate !== undefined) {
    updateData.birthDate = validated.birthDate ? new Date(validated.birthDate) : null;
  }
  if (validated.address !== undefined) {
    updateData.address = validated.address;
  }
  if (validated.city !== undefined) {
    updateData.city = validated.city;
  }
  if (validated.postalCode !== undefined) {
    updateData.postalCode = validated.postalCode;
  }
  if (validated.notes !== undefined) {
    updateData.notes = validated.notes;
  }
  if (validated.tags !== undefined) {
    updateData.tags = validated.tags;
  }

  const client = await prisma.client.update({
    where: { id: clientId },
    data: updateData,
  });

  return client;
}

/**
 * Delete a client
 * Related records (consultations, antecedents, etc.) are cascade deleted
 */
export async function deleteClient(
  clientId: string,
  practitionerId: string,
  options?: { bypassAuth?: boolean }
) {
  // Check authorization
  const existing = await getClient(clientId, practitionerId, {
    bypassAuth: options?.bypassAuth,
  });

  if (!existing) {
    return false;
  }

  await prisma.client.delete({
    where: { id: clientId },
  });

  return true;
}

/**
 * Get client statistics
 */
export async function getClientStats(clientId: string, practitionerId: string) {
  const client = await getClient(clientId, practitionerId);

  if (!client) {
    return null;
  }

  const [consultations, invoices] = await Promise.all([
    prisma.consultation.count({
      where: { clientId },
    }),
    prisma.invoice.findMany({
      where: { clientId },
      select: { total: true },
    }),
  ]);

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);

  return {
    totalConsultations: consultations,
    totalInvoices: invoices.length,
    totalRevenue,
  };
}
