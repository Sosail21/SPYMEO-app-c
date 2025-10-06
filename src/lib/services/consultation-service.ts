import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  createConsultationSchema,
  updateConsultationSchema,
  type CreateConsultationInput,
  type UpdateConsultationInput,
} from '@/lib/validation/client';

/**
 * Create a new consultation
 */
export async function createConsultation(
  practitionerId: string,
  data: CreateConsultationInput
) {
  // Validate input
  const validated = createConsultationSchema.parse(data);

  // Verify client exists and belongs to practitioner
  const client = await prisma.client.findFirst({
    where: {
      id: validated.clientId,
      practitionerId,
    },
  });

  if (!client) {
    throw new Error('Client not found or access denied');
  }

  const consultationData: Prisma.ConsultationCreateInput = {
    client: { connect: { id: validated.clientId } },
    practitioner: { connect: { id: practitionerId } },
    date: new Date(validated.date),
    duration: validated.duration || null,
    type: validated.type || null,
    notes: validated.notes || null,
    recommendations: validated.recommendations || null,
    nextSteps: validated.nextSteps || null,
  };

  const consultation = await prisma.consultation.create({
    data: consultationData,
  });

  return consultation;
}

/**
 * Get a consultation by ID
 */
export async function getConsultation(
  consultationId: string,
  practitionerId: string,
  options?: { include?: Prisma.ConsultationInclude }
) {
  const consultation = await prisma.consultation.findFirst({
    where: {
      id: consultationId,
      practitionerId,
    },
    include: options?.include,
  });

  return consultation;
}

/**
 * List consultations for a client
 */
export async function listConsultations(
  clientId: string,
  practitionerId: string,
  options?: { include?: Prisma.ConsultationInclude }
) {
  // Verify client belongs to practitioner
  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      practitionerId,
    },
  });

  if (!client) {
    return [];
  }

  const consultations = await prisma.consultation.findMany({
    where: { clientId },
    include: options?.include,
    orderBy: { date: 'desc' },
  });

  return consultations;
}

/**
 * Update a consultation
 */
export async function updateConsultation(
  consultationId: string,
  practitionerId: string,
  data: UpdateConsultationInput
) {
  // Validate input
  const validated = updateConsultationSchema.parse(data);

  // Check authorization
  const existing = await getConsultation(consultationId, practitionerId);

  if (!existing) {
    return null;
  }

  // Prepare update data
  const updateData: Prisma.ConsultationUpdateInput = {};

  if (validated.date !== undefined) {
    updateData.date = new Date(validated.date);
  }
  if (validated.duration !== undefined) {
    updateData.duration = validated.duration;
  }
  if (validated.type !== undefined) {
    updateData.type = validated.type;
  }
  if (validated.notes !== undefined) {
    updateData.notes = validated.notes;
  }
  if (validated.recommendations !== undefined) {
    updateData.recommendations = validated.recommendations;
  }
  if (validated.nextSteps !== undefined) {
    updateData.nextSteps = validated.nextSteps;
  }

  const consultation = await prisma.consultation.update({
    where: { id: consultationId },
    data: updateData,
  });

  return consultation;
}

/**
 * Delete a consultation
 */
export async function deleteConsultation(
  consultationId: string,
  practitionerId: string
) {
  // Check authorization
  const existing = await getConsultation(consultationId, practitionerId);

  if (!existing) {
    return false;
  }

  await prisma.consultation.delete({
    where: { id: consultationId },
  });

  return true;
}
