import { http, HttpResponse } from 'msw';
import { testUsers } from '../fixtures/users';
import { testClients } from '../fixtures/data';

const API_BASE = 'http://localhost:3000';

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE}/api/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    const user = testUsers.find((u) => u.email === body.email);

    if (!user || user.password !== body.password) {
      return HttpResponse.json(
        { ok: false, error: 'Identifiants invalides' },
        { status: 401 }
      );
    }

    const session = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return HttpResponse.json(
      { ok: true, role: user.role },
      {
        status: 200,
        headers: {
          'Set-Cookie': `spymeo_session=${JSON.stringify(session)}; Path=/; HttpOnly; SameSite=Lax`,
        },
      }
    );
  }),

  http.post(`${API_BASE}/api/auth/logout`, () => {
    return HttpResponse.json(
      { ok: true },
      {
        status: 200,
        headers: {
          'Set-Cookie': 'spymeo_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
        },
      }
    );
  }),

  // Clients endpoints
  http.get(`${API_BASE}/api/clients`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q')?.toLowerCase() || '';

    const filtered = query
      ? testClients.filter((c) =>
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(query)
        )
      : testClients;

    return HttpResponse.json(filtered, { status: 200 });
  }),

  http.post(`${API_BASE}/api/clients`, async ({ request }) => {
    const body = await request.json() as {
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
    };

    const newClient = {
      id: `client-${Date.now()}`,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      createdAt: new Date().toISOString(),
    };

    return HttpResponse.json(newClient, { status: 201 });
  }),

  http.get(`${API_BASE}/api/clients/:id`, ({ params }) => {
    const { id } = params;
    const client = testClients.find((c) => c.id === id);

    if (!client) {
      return HttpResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return HttpResponse.json(client, { status: 200 });
  }),

  http.patch(`${API_BASE}/api/clients/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as Partial<typeof testClients[0]>;
    const client = testClients.find((c) => c.id === id);

    if (!client) {
      return HttpResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const updated = { ...client, ...body };
    return HttpResponse.json(updated, { status: 200 });
  }),

  http.delete(`${API_BASE}/api/clients/:id`, ({ params }) => {
    const { id } = params;
    const client = testClients.find((c) => c.id === id);

    if (!client) {
      return HttpResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return HttpResponse.json({ ok: true }, { status: 200 });
  }),

  // Account endpoints
  http.get(`${API_BASE}/api/account/me`, () => {
    // By default, return a practitioner user
    const user = testUsers.find((u) => u.role === 'PRACTITIONER');
    return HttpResponse.json(user, { status: 200 });
  }),

  // Stats endpoints
  http.get(`${API_BASE}/api/stats`, () => {
    return HttpResponse.json(
      {
        totalClients: 42,
        totalRevenue: 15000,
        appointmentsThisMonth: 28,
        activeClients: 35,
      },
      { status: 200 }
    );
  }),
];
