import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedClients() {
  console.log('Starting client seeding...');

  // Find or create a test practitioner
  let practitioner = await prisma.user.findFirst({
    where: { role: 'PRACTITIONER' },
  });

  if (!practitioner) {
    console.log('Creating test practitioner...');
    practitioner = await prisma.user.create({
      data: {
        email: 'practitioner@spymeo.test',
        name: 'Dr. Test Practitioner',
        password: 'test-password-hash',
        role: 'PRACTITIONER',
      },
    });
  }

  console.log(`Using practitioner: ${practitioner.name} (${practitioner.id})`);

  // Create sample clients
  const clients = [
    {
      firstName: 'Sophie',
      lastName: 'Laurent',
      email: 'sophie.laurent@example.com',
      phone: '0601020304',
      birthDate: new Date('1985-03-15'),
      address: '12 rue de la Paix',
      city: 'Paris',
      postalCode: '75001',
      tags: ['stress', 'insomnia'],
      notes: 'Patient dealing with work-related stress and sleep issues',
    },
    {
      firstName: 'Marc',
      lastName: 'Dupont',
      email: 'marc.dupont@example.com',
      phone: '0605060708',
      birthDate: new Date('1990-07-22'),
      address: '45 avenue des Champs',
      city: 'Lyon',
      postalCode: '69001',
      tags: ['chronic-pain', 'back-pain'],
      notes: 'Chronic lower back pain, office worker',
    },
    {
      firstName: 'Julie',
      lastName: 'Bernard',
      email: 'julie.bernard@example.com',
      phone: '0609101112',
      birthDate: new Date('1988-11-10'),
      address: '8 boulevard Saint-Michel',
      city: 'Paris',
      postalCode: '75005',
      tags: ['migraine'],
      notes: 'Frequent migraines, seeking natural treatments',
    },
    {
      firstName: 'Pierre',
      lastName: 'Martin',
      email: 'pierre.martin@example.com',
      phone: '0612131415',
      birthDate: new Date('1975-05-20'),
      address: '23 rue de la République',
      city: 'Bordeaux',
      postalCode: '33000',
      tags: ['anxiety', 'digestive'],
      notes: 'Anxiety and digestive issues, dietary concerns',
    },
  ];

  for (const clientData of clients) {
    // Check if client already exists
    const existing = await prisma.client.findFirst({
      where: {
        practitionerId: practitioner.id,
        email: clientData.email,
      },
    });

    if (existing) {
      console.log(`Client ${clientData.firstName} ${clientData.lastName} already exists, skipping...`);
      continue;
    }

    const client = await prisma.client.create({
      data: {
        ...clientData,
        practitionerId: practitioner.id,
      },
    });

    console.log(`Created client: ${client.firstName} ${client.lastName}`);

    // Add some consultations for each client
    const consultationDates = [
      new Date('2024-01-15T10:00:00Z'),
      new Date('2024-02-20T14:00:00Z'),
      new Date('2024-03-25T09:00:00Z'),
    ];

    for (let i = 0; i < 2; i++) {
      await prisma.consultation.create({
        data: {
          clientId: client.id,
          practitionerId: practitioner.id,
          date: consultationDates[i],
          duration: 60,
          type: i === 0 ? 'Initial Consultation' : 'Follow-up',
          notes: i === 0
            ? 'First consultation - patient history taken, initial assessment completed'
            : 'Progress noted, patient responding well to treatment',
          recommendations: 'Continue current treatment plan',
          nextSteps: i < 1 ? 'Schedule follow-up in 4 weeks' : null,
        },
      });
    }

    console.log(`  Added ${2} consultations`);

    // Add some antecedents
    const antecedents = [
      {
        category: 'medical',
        label: 'Hypertension',
        details: 'Diagnosed 2015, controlled with medication',
        date: new Date('2015-06-01'),
      },
      {
        category: 'allergies',
        label: 'Pollen',
        details: 'Seasonal allergies, spring and summer',
        date: null,
      },
    ];

    for (const antecedentData of antecedents) {
      await prisma.antecedent.create({
        data: {
          clientId: client.id,
          ...antecedentData,
        },
      });
    }

    console.log(`  Added ${antecedents.length} antecedents`);

    // Add a sample invoice
    await prisma.invoice.create({
      data: {
        clientId: client.id,
        invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        date: new Date('2024-01-15'),
        dueDate: new Date('2024-02-15'),
        items: [
          {
            description: 'Consultation',
            quantity: 1,
            unitPrice: 80,
            total: 80,
          },
        ],
        subtotal: 80,
        vatRate: 0,
        vatAmount: 0,
        total: 80,
        paid: true,
        paidAt: new Date('2024-01-20'),
        paymentMethod: 'CARD',
      },
    });

    console.log(`  Added 1 invoice`);
  }

  console.log('Client seeding completed!');
}

// Run the seed function
seedClients()
  .catch((e) => {
    console.error('Error seeding clients:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
