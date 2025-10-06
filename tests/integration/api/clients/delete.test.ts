import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { createClient, deleteClient, getClient } from '@/lib/services/client-service';
import { getPractitionerUser } from '../../../fixtures/users';

describe('Client Delete Tests', () => {
  const practitioner = getPractitionerUser();
  let testClientIds: string[] = [];

  afterEach(async () => {
    // Cleanup any remaining clients
    if (testClientIds.length > 0) {
      await prisma.client.deleteMany({
        where: { id: { in: testClientIds } },
      });
      testClientIds = [];
    }
  });

  describe('Successful Deletion', () => {
    it('should delete a client successfully', async () => {
      const client = await createClient(practitioner.id, {
        firstName: 'ToDelete',
        lastName: 'Client',
      });
      testClientIds.push(client.id);

      const result = await deleteClient(client.id, practitioner.id);

      expect(result).toBe(true);

      // Verify client is deleted
      const deleted = await getClient(client.id, practitioner.id);
      expect(deleted).toBeNull();

      // Remove from cleanup list since it's deleted
      testClientIds = testClientIds.filter((id) => id !== client.id);
    });

    it('should return true when client is successfully deleted', async () => {
      const client = await createClient(practitioner.id, {
        firstName: 'Delete',
        lastName: 'Test',
      });
      testClientIds.push(client.id);

      const result = await deleteClient(client.id, practitioner.id);

      expect(result).toBe(true);
      testClientIds = testClientIds.filter((id) => id !== client.id);
    });

    it('should permanently remove client from database', async () => {
      const client = await createClient(practitioner.id, {
        firstName: 'Permanent',
        lastName: 'Delete',
      });
      testClientIds.push(client.id);

      await deleteClient(client.id, practitioner.id);

      // Try to retrieve directly from database
      const dbClient = await prisma.client.findUnique({
        where: { id: client.id },
      });

      expect(dbClient).toBeNull();
      testClientIds = testClientIds.filter((id) => id !== client.id);
    });
  });

  describe('Non-existent Client', () => {
    it('should return false when deleting non-existent client', async () => {
      const result = await deleteClient('non-existent-id', practitioner.id);

      expect(result).toBe(false);
    });

    it('should not throw error for non-existent client', async () => {
      await expect(
        deleteClient('non-existent-id', practitioner.id)
      ).resolves.not.toThrow();
    });
  });

  describe('Authorization Tests', () => {
    it('should prevent deleting other practitioner clients', async () => {
      const client = await createClient(practitioner.id, {
        firstName: 'Protected',
        lastName: 'Client',
      });
      testClientIds.push(client.id);

      const otherPractitionerId = 'user-practitioner-2';
      const result = await deleteClient(client.id, otherPractitionerId);

      expect(result).toBe(false);

      // Verify client still exists
      const stillExists = await getClient(client.id, practitioner.id);
      expect(stillExists).not.toBeNull();
    });

    it('should allow admin to delete any client with bypass', async () => {
      const client = await createClient(practitioner.id, {
        firstName: 'Admin',
        lastName: 'Delete',
      });
      testClientIds.push(client.id);

      const adminId = 'user-admin-1';
      const result = await deleteClient(client.id, adminId, { bypassAuth: true });

      expect(result).toBe(true);

      const deleted = await prisma.client.findUnique({
        where: { id: client.id },
      });
      expect(deleted).toBeNull();

      testClientIds = testClientIds.filter((id) => id !== client.id);
    });
  });

  describe('Cascade Deletion', () => {
    it('should delete client consultations when client is deleted', async () => {
      const client = await createClient(practitioner.id, {
        firstName: 'Cascade',
        lastName: 'Test',
      });
      testClientIds.push(client.id);

      // Create a consultation for the client
      await prisma.consultation.create({
        data: {
          clientId: client.id,
          practitionerId: practitioner.id,
          date: new Date(),
          notes: 'Test consultation',
        },
      });

      // Delete the client
      await deleteClient(client.id, practitioner.id);

      // Verify consultation is also deleted
      const consultations = await prisma.consultation.findMany({
        where: { clientId: client.id },
      });

      expect(consultations.length).toBe(0);
      testClientIds = testClientIds.filter((id) => id !== client.id);
    });

    it('should delete client antecedents when client is deleted', async () => {
      const client = await createClient(practitioner.id, {
        firstName: 'Antecedent',
        lastName: 'Test',
      });
      testClientIds.push(client.id);

      // Create an antecedent for the client
      await prisma.antecedent.create({
        data: {
          clientId: client.id,
          category: 'medical',
          label: 'Test antecedent',
        },
      });

      // Delete the client
      await deleteClient(client.id, practitioner.id);

      // Verify antecedent is also deleted
      const antecedents = await prisma.antecedent.findMany({
        where: { clientId: client.id },
      });

      expect(antecedents.length).toBe(0);
      testClientIds = testClientIds.filter((id) => id !== client.id);
    });

    it('should delete client documents when client is deleted', async () => {
      const client = await createClient(practitioner.id, {
        firstName: 'Document',
        lastName: 'Test',
      });
      testClientIds.push(client.id);

      // Create a document for the client
      await prisma.clientDocument.create({
        data: {
          clientId: client.id,
          title: 'Test Document',
          fileName: 'test.pdf',
          fileUrl: 'https://example.com/test.pdf',
        },
      });

      // Delete the client
      await deleteClient(client.id, practitioner.id);

      // Verify document is also deleted
      const documents = await prisma.clientDocument.findMany({
        where: { clientId: client.id },
      });

      expect(documents.length).toBe(0);
      testClientIds = testClientIds.filter((id) => id !== client.id);
    });

    it('should delete client invoices when client is deleted', async () => {
      const client = await createClient(practitioner.id, {
        firstName: 'Invoice',
        lastName: 'Test',
      });
      testClientIds.push(client.id);

      // Create an invoice for the client
      await prisma.invoice.create({
        data: {
          clientId: client.id,
          invoiceNumber: 'TEST-001',
          date: new Date(),
          items: [],
          subtotal: 0,
          vatRate: 0,
          vatAmount: 0,
          total: 0,
        },
      });

      // Delete the client
      await deleteClient(client.id, practitioner.id);

      // Verify invoice is also deleted
      const invoices = await prisma.invoice.findMany({
        where: { clientId: client.id },
      });

      expect(invoices.length).toBe(0);
      testClientIds = testClientIds.filter((id) => id !== client.id);
    });

    it('should handle client with multiple related records', async () => {
      const client = await createClient(practitioner.id, {
        firstName: 'Multiple',
        lastName: 'Relations',
      });
      testClientIds.push(client.id);

      // Create multiple related records
      await Promise.all([
        prisma.consultation.create({
          data: {
            clientId: client.id,
            practitionerId: practitioner.id,
            date: new Date(),
            notes: 'Consultation 1',
          },
        }),
        prisma.consultation.create({
          data: {
            clientId: client.id,
            practitionerId: practitioner.id,
            date: new Date(),
            notes: 'Consultation 2',
          },
        }),
        prisma.antecedent.create({
          data: {
            clientId: client.id,
            category: 'medical',
            label: 'Antecedent 1',
          },
        }),
        prisma.antecedent.create({
          data: {
            clientId: client.id,
            category: 'surgical',
            label: 'Antecedent 2',
          },
        }),
      ]);

      // Delete the client
      const result = await deleteClient(client.id, practitioner.id);

      expect(result).toBe(true);

      // Verify all related records are deleted
      const [consultations, antecedents] = await Promise.all([
        prisma.consultation.findMany({ where: { clientId: client.id } }),
        prisma.antecedent.findMany({ where: { clientId: client.id } }),
      ]);

      expect(consultations.length).toBe(0);
      expect(antecedents.length).toBe(0);

      testClientIds = testClientIds.filter((id) => id !== client.id);
    });
  });

  describe('Agenda Events Handling', () => {
    it('should set client reference to null in agenda events when client is deleted', async () => {
      const client = await createClient(practitioner.id, {
        firstName: 'Agenda',
        lastName: 'Test',
      });
      testClientIds.push(client.id);

      // Create an agenda event for the client
      const event = await prisma.agendaEvent.create({
        data: {
          practitionerId: practitioner.id,
          title: 'Test Appointment',
          start: new Date(),
          clientId: client.id,
          clientName: `${client.firstName} ${client.lastName}`,
        },
      });

      // Delete the client
      await deleteClient(client.id, practitioner.id);

      // Verify event still exists but client reference is null
      const updatedEvent = await prisma.agendaEvent.findUnique({
        where: { id: event.id },
      });

      expect(updatedEvent).not.toBeNull();
      expect(updatedEvent?.clientId).toBeNull();
      expect(updatedEvent?.clientName).toBe('Agenda Test'); // Should preserve name

      // Cleanup
      await prisma.agendaEvent.delete({ where: { id: event.id } });
      testClientIds = testClientIds.filter((id) => id !== client.id);
    });
  });

  describe('Idempotency', () => {
    it('should handle multiple delete attempts gracefully', async () => {
      const client = await createClient(practitioner.id, {
        firstName: 'Idempotent',
        lastName: 'Delete',
      });
      testClientIds.push(client.id);

      const result1 = await deleteClient(client.id, practitioner.id);
      expect(result1).toBe(true);

      const result2 = await deleteClient(client.id, practitioner.id);
      expect(result2).toBe(false);

      testClientIds = testClientIds.filter((id) => id !== client.id);
    });
  });

  describe('Performance Tests', () => {
    it('should delete client quickly', async () => {
      const client = await createClient(practitioner.id, {
        firstName: 'Performance',
        lastName: 'Test',
      });
      testClientIds.push(client.id);

      const start = Date.now();
      await deleteClient(client.id, practitioner.id);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // Should be under 1 second

      testClientIds = testClientIds.filter((id) => id !== client.id);
    });
  });
});
