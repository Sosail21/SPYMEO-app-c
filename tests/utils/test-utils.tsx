import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { SWRConfig } from 'swr';

/**
 * Custom render function that wraps components with necessary providers
 * This ensures consistent test environment across all component tests
 */

// SWR Provider with disabled cache for tests
const TestProviders = ({ children }: { children: ReactNode }) => {
  return (
    <SWRConfig
      value={{
        provider: () => new Map(),
        dedupingInterval: 0,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        shouldRetryOnError: false,
      }}
    >
      {children}
    </SWRConfig>
  );
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /**
   * Optional wrapper to use instead of default TestProviders
   */
  wrapper?: ({ children }: { children: ReactNode }) => ReactElement;
}

/**
 * Custom render function that includes all necessary providers
 * @param ui - Component to render
 * @param options - Render options
 */
const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  const Wrapper = options?.wrapper || TestProviders;
  return render(ui, { wrapper: Wrapper, ...options });
};

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method with custom render
export { customRender as render };

/**
 * Helper to wait for async updates
 * Useful when testing components that use useEffect or async state updates
 */
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Helper to simulate user typing with delay
 * More realistic than userEvent.type with delay: 0
 */
export const typeWithDelay = async (
  element: HTMLElement,
  text: string,
  delay = 10
) => {
  const { userEvent } = await import('@testing-library/user-event');
  const user = userEvent.setup({ delay });
  await user.type(element, text);
};

/**
 * Helper to find element by text content (case insensitive)
 */
export const findByTextCI = (text: string) => {
  return (content: string, element: Element | null) => {
    const hasText = (node: Element | null) =>
      node?.textContent?.toLowerCase().includes(text.toLowerCase()) ?? false;
    const elementHasText = hasText(element);
    return elementHasText;
  };
};

/**
 * Mock window.location for navigation tests
 */
export const mockWindowLocation = (pathname = '/') => {
  delete (window as any).location;
  window.location = {
    pathname,
    search: '',
    hash: '',
    href: `http://localhost:3000${pathname}`,
  } as Location;
};

/**
 * Helper to create a mock File object for file upload tests
 */
export const createMockFile = (
  name = 'test.pdf',
  size = 1024,
  type = 'application/pdf'
) => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

/**
 * Helper to mock console methods temporarily
 */
export const mockConsole = () => {
  const originalConsole = { ...console };
  const mocks = {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  };

  console.log = mocks.log;
  console.error = mocks.error;
  console.warn = mocks.warn;
  console.info = mocks.info;

  return {
    mocks,
    restore: () => {
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
      console.info = originalConsole.info;
    },
  };
};
