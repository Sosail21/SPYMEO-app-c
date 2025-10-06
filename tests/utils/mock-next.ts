import { vi } from 'vitest';

/**
 * Next.js Mocks
 * Mock implementations of Next.js specific modules for testing
 */

// Mock next/navigation
export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
};

export const mockUseRouter = () => mockRouter;

export const mockUsePathname = () => mockRouter.pathname;

export const mockUseSearchParams = () => {
  return {
    get: vi.fn((key: string) => null),
    getAll: vi.fn((key: string) => []),
    has: vi.fn((key: string) => false),
    toString: vi.fn(() => ''),
  };
};

// Mock next/link
export const MockLink = ({ children, href, ...props }: any) => {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
};

// Mock next/image
export const MockImage = ({ src, alt, ...props }: any) => {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} {...props} />;
};

// Mock next/headers
export const mockCookies = () => {
  const cookieStore = new Map<string, any>();

  return {
    get: vi.fn((name: string) => {
      const value = cookieStore.get(name);
      return value ? { name, value } : undefined;
    }),
    set: vi.fn((name: string, value: string, options?: any) => {
      cookieStore.set(name, value);
    }),
    delete: vi.fn((name: string) => {
      cookieStore.delete(name);
    }),
    has: vi.fn((name: string) => cookieStore.has(name)),
    clear: vi.fn(() => cookieStore.clear()),
    getAll: vi.fn(() => {
      return Array.from(cookieStore.entries()).map(([name, value]) => ({
        name,
        value,
      }));
    }),
  };
};

export const mockHeaders = () => {
  const headerStore = new Map<string, string>();

  return {
    get: vi.fn((name: string) => headerStore.get(name.toLowerCase()) || null),
    set: vi.fn((name: string, value: string) => {
      headerStore.set(name.toLowerCase(), value);
    }),
    has: vi.fn((name: string) => headerStore.has(name.toLowerCase())),
    delete: vi.fn((name: string) => {
      headerStore.delete(name.toLowerCase());
    }),
  };
};

// Setup function to initialize all Next.js mocks
export const setupNextMocks = () => {
  // Mock next/navigation
  vi.mock('next/navigation', () => ({
    useRouter: mockUseRouter,
    usePathname: mockUsePathname,
    useSearchParams: mockUseSearchParams,
    redirect: vi.fn(),
    notFound: vi.fn(),
  }));

  // Mock next/link
  vi.mock('next/link', () => ({
    default: MockLink,
  }));

  // Mock next/image
  vi.mock('next/image', () => ({
    default: MockImage,
  }));

  // Mock next/headers
  vi.mock('next/headers', () => ({
    cookies: mockCookies,
    headers: mockHeaders,
  }));
};

// Reset all Next.js mocks
export const resetNextMocks = () => {
  mockRouter.push.mockClear();
  mockRouter.replace.mockClear();
  mockRouter.prefetch.mockClear();
  mockRouter.back.mockClear();
  mockRouter.forward.mockClear();
  mockRouter.refresh.mockClear();
  mockRouter.pathname = '/';
  mockRouter.query = {};
  mockRouter.asPath = '/';
};

/**
 * Helper to set the current route in tests
 */
export const setMockRoute = (pathname: string, query: Record<string, any> = {}) => {
  mockRouter.pathname = pathname;
  mockRouter.query = query;
  mockRouter.asPath = pathname + (Object.keys(query).length > 0 ? '?' + new URLSearchParams(query).toString() : '');
};

/**
 * Helper to create a mock Next.js Request object
 */
export const createMockRequest = (
  url: string,
  options: RequestInit = {}
) => {
  return new Request(`http://localhost:3000${url}`, {
    method: 'GET',
    ...options,
  });
};

/**
 * Helper to create mock Next.js Response
 */
export const createMockNextResponse = (data: any, init?: ResponseInit) => {
  return {
    json: () => Promise.resolve(data),
    status: init?.status || 200,
    ok: !init?.status || init.status < 400,
    headers: new Headers(init?.headers),
  };
};

/**
 * Mock session data for testing authenticated routes
 */
export const mockSession = (sessionData: any) => {
  const cookies = mockCookies();
  cookies.set('spymeo_session', JSON.stringify(sessionData));
  return cookies;
};
