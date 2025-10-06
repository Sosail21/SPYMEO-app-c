import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  createAntecedentSchema,
  updateAntecedentSchema,
  type CreateAntecedentInput,
  type UpdateAntecedentInput,
} from '@/lib/validation/client';

/**
 * Create a new antecedent
 */
export async function createAntecedent(data: CreateAntecedentInput) {
  // Validate input
  const validated = createAntecedentSchema.parse(data);

  // Verify client exists
  const client = await prisma.client.findUnique({
    where: { id: validated.clientId },
  });

  if (!client) {
    throw new Error('Client not found');
  }

  const antecedentData: Prisma.AntecedentCreateInput = {
    client: { connect: { id: validated.clientId } },
    category: validated.category,
    label: validated.label,
    details: validated.details || null,
    date: validated.date ? new Date(validated.date) : null,
  };

  const antecedent = await prisma.antecedent.create({
    data: antecedentData,
  });

  return antecedent;
}

/**
 * Get an antecedent by ID
 */
export async function getAntecedent(
  antecedentId: string,
  options?: { include?: Prisma.AntecedentInclude }
) {
  const antecedent = await prisma.antecedent.findUnique({
    where: { id: antecedentId },
    include: options?.include,
  });

  return antecedent;
}

/**
 * List antecedents for a client
 */
export async function listAntecedents(
  clientId: string,
  filters?: { category?: string }
) {
  const where: Prisma.AntecedentWhereInput = {
    clientId,
  };

  if (filters?.category) {
    where.category = filters.category;
  }

  const antecedents = await prisma.antecedent.findMany({
    where,
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  });

  return antecedents;
}

/**
 * Update an antecedent
 */
export async function updateAntecedent(
  antecedentId: string,
  data: UpdateAntecedentInput
) {
  // Validate input
  const validated = updateAntecedentSchema.parse(data);

  // Check if exists
  const existing = await getAntecedent(antecedentId);

  if (!existing) {
    return null;
  }

  // Prepare update data
  const updateData: Prisma.AntecedentUpdateInput = {};

  if (validated.category !== undefined) {
    updateData.category = validated.category;
  }
  if (validated.label !== undefined) {
    updateData.label = validated.label;
  }
  if (validated.details !== undefined) {
    updateData.details = validated.details;
  }
  if (validated.date !== undefined) {
    updateData.date = validated.date ? new Date(validated.date) : null;
  }

  const antecedent = await prisma.antecedent.update({
    where: { id: antecedentId },
    data: updateData,
  });

  return antecedent;
}

/**
 * Delete an antecedent
 */
export async function deleteAntecedent(antecedentId: string) {
  // Check if exists
  const existing = await getAntecedent(antecedentId);

  if (!existing) {
    return false;
  }

  await prisma.antecedent.delete({
    where: { id: antecedentId },
  });

  return true;
}
