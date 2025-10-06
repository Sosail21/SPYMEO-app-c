import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW server for Node.js environment (tests)
 * This interceptor will catch all HTTP requests during tests
 * and respond with the mocked handlers defined in ./handlers.ts
 */
export const server = setupServer(...handlers);
