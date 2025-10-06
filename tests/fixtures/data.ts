/**
 * Test data fixtures for SPYMEO application
 * These fixtures provide consistent test data across all tests
 */

export const testClients = [
  {
    id: 'client-1',
    firstName: 'Sophie',
    lastName: 'Laurent',
    email: 'sophie.laurent@example.com',
    phone: '0601020304',
    birthDate: '1985-03-15',
    address: '12 rue de la Paix, 75001 Paris',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'client-2',
    firstName: 'Marc',
    lastName: 'Dupont',
    email: 'marc.dupont@example.com',
    phone: '0605060708',
    birthDate: '1990-07-22',
    address: '45 avenue des Champs, 75008 Paris',
    createdAt: '2024-02-20T14:30:00Z',
  },
  {
    id: 'client-3',
    firstName: 'Julie',
    lastName: 'Bernard',
    email: 'julie.bernard@example.com',
    phone: '0609101112',
    birthDate: '1988-11-10',
    address: '8 boulevard Saint-Michel, 75005 Paris',
    createdAt: '2024-03-10T09:15:00Z',
  },
];

export const testConsultations = [
  {
    id: 'consult-1',
    clientId: 'client-1',
    date: '2024-01-20T10:00:00Z',
    duration: 60,
    notes: 'Premiere consultation',
    diagnosis: 'Stress chronique',
    treatment: 'Relaxation et gestion du stress',
  },
  {
    id: 'consult-2',
    clientId: 'client-1',
    date: '2024-02-15T14:00:00Z',
    duration: 45,
    notes: 'Suivi consultation',
    diagnosis: 'Amelioration progressive',
    treatment: 'Poursuite du traitement',
  },
  {
    id: 'consult-3',
    clientId: 'client-2',
    date: '2024-02-25T11:00:00Z',
    duration: 60,
    notes: 'Consultation initiale',
    diagnosis: 'Douleurs dorsales',
    treatment: 'Osteopathie douce',
  },
];

export const testDocuments = [
  {
    id: 'doc-1',
    clientId: 'client-1',
    name: 'Ordonnance.pdf',
    type: 'ordonnance',
    url: '/documents/ordonnance-1.pdf',
    uploadedAt: '2024-01-20T11:00:00Z',
  },
  {
    id: 'doc-2',
    clientId: 'client-1',
    name: 'Resultat analyse.pdf',
    type: 'analyse',
    url: '/documents/analyse-1.pdf',
    uploadedAt: '2024-02-01T09:30:00Z',
  },
  {
    id: 'doc-3',
    clientId: 'client-2',
    name: 'Radiographie.jpg',
    type: 'imagerie',
    url: '/documents/radio-1.jpg',
    uploadedAt: '2024-02-25T15:00:00Z',
  },
];

export const testInvoices = [
  {
    id: 'inv-1',
    clientId: 'client-1',
    number: 'INV-2024-001',
    date: '2024-01-20',
    amount: 80,
    status: 'paid',
    description: 'Consultation osteopathie',
  },
  {
    id: 'inv-2',
    clientId: 'client-1',
    number: 'INV-2024-002',
    date: '2024-02-15',
    amount: 60,
    status: 'paid',
    description: 'Suivi consultation',
  },
  {
    id: 'inv-3',
    clientId: 'client-2',
    number: 'INV-2024-003',
    date: '2024-02-25',
    amount: 80,
    status: 'pending',
    description: 'Consultation initiale',
  },
];

export const testAppointments = [
  {
    id: 'appt-1',
    clientId: 'client-1',
    practitionerId: 'user-practitioner-1',
    date: '2024-12-15T10:00:00Z',
    duration: 60,
    type: 'consultation',
    status: 'confirmed',
    notes: 'Consultation de suivi',
  },
  {
    id: 'appt-2',
    clientId: 'client-2',
    practitionerId: 'user-practitioner-1',
    date: '2024-12-16T14:00:00Z',
    duration: 45,
    type: 'consultation',
    status: 'pending',
    notes: 'Premiere consultation',
  },
  {
    id: 'appt-3',
    clientId: 'client-3',
    practitionerId: 'user-practitioner-2',
    date: '2024-12-20T09:00:00Z',
    duration: 60,
    type: 'bilan',
    status: 'confirmed',
    notes: 'Bilan complet',
  },
];

export const testProducts = [
  {
    id: 'prod-1',
    name: 'Huile essentielle Lavande',
    description: 'Huile essentielle bio 10ml',
    price: 12.5,
    stock: 45,
    category: 'huiles-essentielles',
    sku: 'HE-LAV-10',
  },
  {
    id: 'prod-2',
    name: 'Tisane Relaxation',
    description: 'Melange de plantes bio 100g',
    price: 8.9,
    stock: 28,
    category: 'tisanes',
    sku: 'TIS-REL-100',
  },
  {
    id: 'prod-3',
    name: 'Complement Vitamine D',
    description: 'Vitamine D3 - 60 gelules',
    price: 15.5,
    stock: 62,
    category: 'complements',
    sku: 'COMP-VITD-60',
  },
];

export const testOrders = [
  {
    id: 'order-1',
    clientId: 'client-1',
    date: '2024-02-10T10:30:00Z',
    total: 41.4,
    status: 'delivered',
    items: [
      { productId: 'prod-1', quantity: 2, price: 12.5 },
      { productId: 'prod-2', quantity: 2, price: 8.9 },
    ],
  },
  {
    id: 'order-2',
    clientId: 'client-2',
    date: '2024-03-01T15:00:00Z',
    total: 15.5,
    status: 'pending',
    items: [{ productId: 'prod-3', quantity: 1, price: 15.5 }],
  },
];

export const testResources = [
  {
    id: 'res-1',
    title: 'Guide nutrition sante',
    description: 'Guide complet sur la nutrition',
    type: 'pdf',
    category: 'nutrition',
    url: '/resources/guide-nutrition.pdf',
    tags: ['nutrition', 'sante', 'guide'],
    uploadedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'res-2',
    title: 'Exercices posturaux',
    description: 'Serie exercices pour ameliorer la posture',
    type: 'video',
    category: 'exercices',
    url: '/resources/exercices-posture.mp4',
    tags: ['posture', 'exercices', 'video'],
    uploadedAt: '2024-02-20T14:00:00Z',
  },
  {
    id: 'res-3',
    title: 'Protocole relaxation',
    description: 'Techniques de relaxation guidees',
    type: 'audio',
    category: 'relaxation',
    url: '/resources/relaxation.mp3',
    tags: ['relaxation', 'meditation', 'audio'],
    uploadedAt: '2024-03-10T09:00:00Z',
  },
];

// Helper functions to create test data
export const createTestClient = (overrides = {}) => ({
  id: `client-test-${Date.now()}`,
  firstName: 'Test',
  lastName: 'Client',
  email: 'test@example.com',
  phone: '0600000000',
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createTestAppointment = (overrides = {}) => ({
  id: `appt-test-${Date.now()}`,
  clientId: 'client-1',
  practitionerId: 'user-practitioner-1',
  date: new Date().toISOString(),
  duration: 60,
  type: 'consultation',
  status: 'pending',
  ...overrides,
});

export const createTestInvoice = (overrides = {}) => ({
  id: `inv-test-${Date.now()}`,
  clientId: 'client-1',
  number: `INV-TEST-${Date.now()}`,
  date: new Date().toISOString().split('T')[0],
  amount: 80,
  status: 'pending',
  description: 'Test invoice',
  ...overrides,
});
