# SPYMEO Tests

This directory contains all tests for the SPYMEO Next.js application.

## Quick Start

```bash
# Run all tests in watch mode (recommended for development)
npm run test:watch

# Run all tests once
npm test

# Run with interactive UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Directory Structure

```
/tests/
├── setup.ts                    # Global test configuration
├── /fixtures/                  # Test data
│   ├── users.ts               # User fixtures (8 roles)
│   └── data.ts                # Data fixtures (clients, appointments, etc.)
├── /mocks/                     # MSW API mocks
│   ├── handlers.ts            # API endpoint handlers
│   └── server.ts              # MSW server setup
├── /utils/                     # Test utilities
│   ├── test-utils.tsx         # Custom render with providers
│   ├── api-test-utils.ts      # API testing helpers
│   └── mock-next.ts           # Next.js mocks
├── /unit/                      # Unit tests (pure functions, logic)
├── /integration/               # Integration tests (APIs, workflows)
└── /components/                # Component tests (React components)
```

## Test Types

### Unit Tests (`/unit/`)
Test individual functions or modules in isolation.

**Example:**
```typescript
import { canAccess } from '@/lib/rbac';

it('should allow access to public routes', () => {
  expect(canAccess('/')).toBe(true);
});
```

**When to use:**
- Pure functions
- Business logic
- Utilities
- Validators

### Integration Tests (`/integration/`)
Test how multiple parts work together, especially APIs.

**Example:**
```typescript
it('should login successfully', async () => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  expect(response.status).toBe(200);
});
```

**When to use:**
- API routes
- Database operations
- Multiple modules interacting

### Component Tests (`/components/`)
Test React components with user interactions.

**Example:**
```typescript
import { render, screen } from '../../utils/test-utils';
import ClientList from '@/components/patient/ClientList';

it('should display clients', async () => {
  render(<ClientList />);
  await waitFor(() => {
    expect(screen.getByText('Sophie Laurent')).toBeInTheDocument();
  });
});
```

**When to use:**
- User interactions
- Component rendering
- State changes
- Visual feedback

## Test Utilities

### Custom Render
Use the custom `render` that includes providers:

```typescript
import { render, screen } from '../../utils/test-utils';
```

### API Mocking
```typescript
import { mockApiResponse, mockApiError } from '../../utils/api-test-utils';

// Mock successful response
mockApiResponse('get', '/api/clients', testClients);

// Mock error
mockApiError('get', '/api/clients', 'Server error', 500);
```

### Fixtures
```typescript
import { testClients, getPractitionerUser } from '../../fixtures/data';

const client = testClients[0];
const user = getPractitionerUser();
```

## Common Patterns

### Testing Forms
```typescript
const user = userEvent.setup();
await user.type(screen.getByLabelText(/email/i), 'test@example.com');
await user.click(screen.getByRole('button', { name: /submit/i }));
```

### Testing Loading States
```typescript
mockDelayedResponse('get', '/api/clients', testClients, 1000);
expect(screen.getByText(/loading/i)).toBeInTheDocument();

await waitFor(() => {
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
});
```

### Testing Errors
```typescript
mockApiError('get', '/api/clients', 'Server error', 500);

await waitFor(() => {
  expect(screen.getByText(/error/i)).toBeInTheDocument();
});
```

## Writing Your First Test

1. **Identify what to test**
   - What feature are you building?
   - What should it do?

2. **Create test file** in appropriate directory:
   - `/unit/` for functions
   - `/integration/` for APIs
   - `/components/` for React components

3. **Write the test first (TDD)**:
   ```typescript
   import { describe, it, expect } from 'vitest';

   describe('MyFeature', () => {
     it('should do something', () => {
       // Test code
     });
   });
   ```

4. **Run test** (it should fail):
   ```bash
   npm test
   ```

5. **Implement the feature**

6. **Run test again** (it should pass)

7. **Refactor** if needed

## Best Practices

1. ✅ **Test behavior, not implementation**
   - Test what users see/experience
   - Avoid testing internal state

2. ✅ **Use descriptive test names**
   ```typescript
   // Good
   it('should display error message when login fails', () => {});

   // Bad
   it('works', () => {});
   ```

3. ✅ **Follow Arrange-Act-Assert (AAA)**
   ```typescript
   it('should add client', async () => {
     // Arrange
     const newClient = createTestClient();
     render(<ClientList />);

     // Act
     await userEvent.click(screen.getByRole('button', { name: /add/i }));

     // Assert
     expect(screen.getByText(newClient.firstName)).toBeInTheDocument();
   });
   ```

4. ✅ **Use fixtures for consistent data**
   ```typescript
   import { testClients } from '../../fixtures/data';
   ```

5. ✅ **Test edge cases**
   - Happy path
   - Error cases
   - Empty/null values
   - Boundary conditions

6. ✅ **Keep tests independent**
   - Each test should run independently
   - Use `beforeEach` to reset state

7. ✅ **Don't test third-party libraries**
   - Test YOUR code, not React/Next.js

8. ✅ **Use `waitFor` for async operations**
   ```typescript
   await waitFor(() => {
     expect(screen.getByText('Data loaded')).toBeInTheDocument();
   });
   ```

## Debugging Tests

```typescript
// See rendered HTML
screen.debug();

// See specific element
screen.debug(screen.getByRole('button'));
```

Run with verbose output:
```bash
npm test -- --reporter=verbose
```

Run single test file:
```bash
npm test -- ClientList.test.tsx
```

Run tests matching pattern:
```bash
npm test -- --grep "should login"
```

## Coverage

Generate coverage report:
```bash
npm run test:coverage
```

View in browser:
```bash
open coverage/index.html  # Mac/Linux
start coverage/index.html # Windows
```

## More Information

See `/docs/testing-guide.md` for comprehensive testing documentation.

---

Happy Testing! 🚀
