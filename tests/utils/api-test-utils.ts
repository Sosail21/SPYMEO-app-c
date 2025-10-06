import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';

/**
 * API Testing Utilities
 * Helper functions for testing API routes and HTTP interactions
 */

const API_BASE = 'http://localhost:3000';

/**
 * Creates a mock API response for a specific endpoint
 * @param method - HTTP method
 * @param path - API path
 * @param response - Response data or HttpResponse
 * @param status - HTTP status code
 */
export const mockApiResponse = (
  method: 'get' | 'post' | 'patch' | 'put' | 'delete',
  path: string,
  response: any,
  status = 200
) => {
  const fullPath = path.startsWith('http') ? path : `${API_BASE}${path}`;

  server.use(
    http[method](fullPath, () => {
      if (response instanceof HttpResponse) {
        return response;
      }
      return HttpResponse.json(response, { status });
    })
  );
};

/**
 * Mock an API error response
 */
export const mockApiError = (
  method: 'get' | 'post' | 'patch' | 'put' | 'delete',
  path: string,
  error: string,
  status = 500
) => {
  mockApiResponse(method, path, { error }, status);
};

/**
 * Mock a network error
 */
export const mockNetworkError = (
  method: 'get' | 'post' | 'patch' | 'put' | 'delete',
  path: string
) => {
  const fullPath = path.startsWith('http') ? path : `${API_BASE}${path}`;

  server.use(
    http[method](fullPath, () => {
      return HttpResponse.error();
    })
  );
};

/**
 * Mock a delayed response (useful for testing loading states)
 */
export const mockDelayedResponse = (
  method: 'get' | 'post' | 'patch' | 'put' | 'delete',
  path: string,
  response: any,
  delay = 1000,
  status = 200
) => {
  const fullPath = path.startsWith('http') ? path : `${API_BASE}${path}`;

  server.use(
    http[method](fullPath, async () => {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return HttpResponse.json(response, { status });
    })
  );
};

/**
 * Helper to create a mock fetch response
 */
export const createMockResponse = (data: any, status = 200, ok = true) => {
  return {
    ok,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    blob: async () => new Blob([JSON.stringify(data)]),
    headers: new Headers(),
  } as Response;
};

/**
 * Wait for all pending promises to resolve
 * Useful after triggering async operations in tests
 */
export const waitForAsync = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Mock authenticated API call with session cookie
 */
export const mockAuthenticatedRequest = (
  method: 'get' | 'post' | 'patch' | 'put' | 'delete',
  path: string,
  response: any,
  sessionData: any,
  status = 200
) => {
  const fullPath = path.startsWith('http') ? path : `${API_BASE}${path}`;

  server.use(
    http[method](fullPath, async ({ request }) => {
      const cookieHeader = request.headers.get('cookie');

      if (!cookieHeader || !cookieHeader.includes('spymeo_session')) {
        return HttpResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      return HttpResponse.json(response, { status });
    })
  );
};

/**
 * Helper to verify request was made with correct body
 */
export const captureRequestBody = () => {
  let capturedBody: any = null;

  return {
    middleware: async ({ request }: { request: Request }) => {
      if (request.method !== 'GET') {
        capturedBody = await request.clone().json();
      }
    },
    getBody: () => capturedBody,
    reset: () => {
      capturedBody = null;
    },
  };
};

/**
 * Mock paginated API response
 */
export const mockPaginatedResponse = (
  method: 'get' | 'post',
  path: string,
  items: any[],
  page = 1,
  perPage = 10
) => {
  const fullPath = path.startsWith('http') ? path : `${API_BASE}${path}`;

  server.use(
    http[method](fullPath, ({ request }) => {
      const url = new URL(request.url);
      const currentPage = parseInt(url.searchParams.get('page') || '1');
      const pageSize = parseInt(url.searchParams.get('per_page') || String(perPage));

      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      const paginatedItems = items.slice(start, end);

      return HttpResponse.json({
        items: paginatedItems,
        page: currentPage,
        per_page: pageSize,
        total: items.length,
        total_pages: Math.ceil(items.length / pageSize),
      });
    })
  );
};

/**
 * Helper to test file upload
 */
export const createFormDataWithFile = (
  file: File,
  fieldName = 'file',
  additionalFields: Record<string, string> = {}
) => {
  const formData = new FormData();
  formData.append(fieldName, file);

  Object.entries(additionalFields).forEach(([key, value]) => {
    formData.append(key, value);
  });

  return formData;
};
