# SPYMEO Testing Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Setup](#setup)
3. [Running Tests](#running-tests)
4. [Test-Driven Development (TDD)](#test-driven-development-tdd)
5. [Writing Tests](#writing-tests)
   - [Unit Tests](#unit-tests)
   - [Integration Tests](#integration-tests)
   - [Component Tests](#component-tests)
6. [Test Utilities](#test-utilities)
7. [Mocking](#mocking)
8. [Best Practices](#best-practices)
9. [Common Patterns](#common-patterns)
10. [Troubleshooting](#troubleshooting)

---

## Introduction

This guide covers testing practices for the SPYMEO Next.js application using Vitest and React Testing Library. Our testing philosophy focuses on:

- **Test-Driven Development (TDD)**: Write tests before implementation
- **User-centric testing**: Test behavior, not implementation details
- **Confidence**: Tests should give confidence that features work correctly
- **Maintainability**: Tests should be easy to understand and maintain

### Testing Stack

- **Vitest**: Fast, modern test runner with great TypeScript support
- **React Testing Library**: Testing library for React components
- **MSW (Mock Service Worker)**: API mocking at the network level
- **Happy DOM**: Lightweight DOM implementation for tests

---

## Setup

The testing infrastructure is already set up in this project. Key files:

```
/vitest.config.ts          # Vitest configuration
/tests/
  /setup.ts                # Global test setup
  /fixtures/               # Test data fixtures
    users.ts               # User fixtures
    data.ts                # Data fixtures (clients, appointments, etc.)
  /mocks/                  # MSW mocks
    handlers.ts            # API endpoint handlers
    server.ts              # MSW server setup
  /utils/                  # Test utilities
    test-utils.tsx         # Custom render with providers
    api-test-utils.ts      # API testing helpers
    mock-next.ts           # Next.js mocks
  /unit/                   # Unit tests
  /integration/            # Integration tests
  /components/             # Component tests
```

---

## Running Tests

### Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run only component tests
npm run test:component

# Run with UI (interactive)
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Watch Mode

In watch mode, tests automatically re-run when files change. Press `h` in the terminal for help.

---

## Test-Driven Development (TDD)

TDD follows the Red-Green-Refactor cycle:

### 1. Red: Write a failing test

Write a test for the feature you want to implement. The test should fail initially.

```typescript
// Example: Testing a new validation function
describe('validateEmail', () => {
  it('should return true for valid email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });
});
```

### 2. Green: Make the test pass

Write the minimum code needed to make the test pass.

```typescript
// Implementation
export function validateEmail(email: string): boolean {
  return email.includes('@') && email.includes('.');
}
```

### 3. Refactor: Improve the code

Refactor the code while keeping tests green.

```typescript
// Better implementation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

### TDD Benefits

- Forces you to think about requirements before coding
- Results in testable, modular code
- Provides immediate feedback
- Creates a safety net for refactoring
- Documents expected behavior

---

## Writing Tests

### Unit Tests

Unit tests test individual functions or modules in isolation.

**Location**: `tests/unit/`

**Example**: Testing RBAC function

```typescript
import { describe, it, expect } from 'vitest';
import { canAccess } from '@/lib/rbac';

describe('canAccess', () => {
  it('should allow access to public routes', () => {
    expect(canAccess('/')).toBe(true);
    expect(canAccess('/blog')).toBe(true);
  });

  it('should deny access to protected routes without role', () => {
    expect(canAccess('/pro/dashboard')).toBe(false);
  });

  it('should allow practitioner access to practitioner routes', () => {
    expect(canAccess('/pro/praticien/agenda', 'PRACTITIONER')).toBe(true);
  });
});
```

**When to use unit tests**:
- Pure functions (utilities, helpers)
- Business logic
- Data transformations
- Validators

### Integration Tests

Integration tests test how multiple parts work together, especially API routes.

**Location**: `tests/integration/`

**Example**: Testing API endpoint

```typescript
import { describe, it, expect } from 'vitest';
import { testUsers } from '../../fixtures/users';

describe('POST /api/auth/login', () => {
  const API_URL = 'http://localhost:3000/api/auth/login';

  it('should login successfully with valid credentials', async () => {
    const user = testUsers[0];

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        password: user.password,
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.ok).toBe(true);
  });
});
```

**When to use integration tests**:
- API routes
- Database operations
- Multiple modules interacting
- End-to-end workflows

### Component Tests

Component tests test React components with user interactions.

**Location**: `tests/components/`

**Example**: Testing a client list component

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import ClientList from '@/components/patient/ClientList';

describe('ClientList', () => {
  it('should display list of clients', async () => {
    render(<ClientList />);

    await waitFor(() => {
      expect(screen.getByText('Sophie Laurent')).toBeInTheDocument();
    });
  });

  it('should filter clients by search', async () => {
    const user = userEvent.setup();
    render(<ClientList />);

    const searchInput = screen.getByPlaceholderText(/rechercher/i);
    await user.type(searchInput, 'Sophie');

    await waitFor(() => {
      expect(screen.getByText('Sophie Laurent')).toBeInTheDocument();
      expect(screen.queryByText('Marc Dupont')).not.toBeInTheDocument();
    });
  });
});
```

**When to use component tests**:
- User interactions (clicks, typing, form submission)
- Conditional rendering
- Component state changes
- Visual feedback

---

## Test Utilities

### Custom Render

Use the custom `render` function that includes all necessary providers:

```typescript
import { render, screen } from '../../utils/test-utils';

test('my component', () => {
  render(<MyComponent />);
  // ...
});
```

### API Mocking Helpers

```typescript
import { mockApiResponse, mockApiError, mockDelayedResponse } from '../../utils/api-test-utils';

// Mock successful response
mockApiResponse('get', '/api/clients', testClients);

// Mock error response
mockApiError('get', '/api/clients', 'Server error', 500);

// Mock delayed response (test loading states)
mockDelayedResponse('get', '/api/clients', testClients, 1000);
```

### Next.js Mocks

```typescript
import { mockRouter, setMockRoute } from '../../utils/mock-next';

// Set current route
setMockRoute('/pro/dashboard');

// Check navigation
mockRouter.push('/some-route');
expect(mockRouter.push).toHaveBeenCalledWith('/some-route');
```

---

## Mocking

### API Mocking with MSW

MSW intercepts network requests at the network level, providing realistic API mocking.

**Global handlers** are defined in `tests/mocks/handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('http://localhost:3000/api/clients', () => {
    return HttpResponse.json(testClients);
  }),
];
```

**Override handlers** in specific tests:

```typescript
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

test('handle error', async () => {
  server.use(
    http.get('/api/clients', () => {
      return HttpResponse.json(
        { error: 'Server error' },
        { status: 500 }
      );
    })
  );

  // Test error handling
});
```

### Mocking Functions

Use Vitest's `vi.fn()` to create mock functions:

```typescript
import { vi } from 'vitest';

const mockFn = vi.fn();

// Call the function
mockFn('arg1', 'arg2');

// Assertions
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
expect(mockFn).toHaveBeenCalledTimes(1);
```

### Mocking Modules

```typescript
import { vi } from 'vitest';

vi.mock('@/lib/someModule', () => ({
  someFunction: vi.fn(() => 'mocked value'),
}));
```

---

## Best Practices

### 1. Test Behavior, Not Implementation

**Bad**: Testing implementation details

```typescript
// Don't do this
expect(component.state.count).toBe(5);
```

**Good**: Testing user-visible behavior

```typescript
// Do this
expect(screen.getByText('Count: 5')).toBeInTheDocument();
```

### 2. Use Descriptive Test Names

**Bad**:
```typescript
it('works', () => { /* ... */ });
```

**Good**:
```typescript
it('should display error message when login fails', () => { /* ... */ });
```

### 3. Arrange-Act-Assert (AAA) Pattern

```typescript
it('should add client to list', async () => {
  // Arrange
  const newClient = createTestClient();
  render(<ClientList />);

  // Act
  const addButton = screen.getByRole('button', { name: /add/i });
  await userEvent.click(addButton);

  // Assert
  expect(screen.getByText(newClient.firstName)).toBeInTheDocument();
});
```

### 4. Use Test Fixtures

Keep test data in fixtures for consistency:

```typescript
import { testClients, getPractitionerUser } from '../../fixtures/data';

// Use in tests
const client = testClients[0];
const user = getPractitionerUser();
```

### 5. Test Edge Cases

Don't just test the happy path:

```typescript
describe('validateEmail', () => {
  it('should return true for valid email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('should return false for email without @', () => {
    expect(validateEmail('invalid.email.com')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('should return false for null', () => {
    expect(validateEmail(null as any)).toBe(false);
  });
});
```

### 6. Avoid Testing Third-Party Libraries

Don't test React, Next.js, or other libraries. Test YOUR code.

**Bad**:
```typescript
it('should render a div', () => {
  const { container } = render(<div>Test</div>);
  expect(container.querySelector('div')).toBeInTheDocument();
});
```

**Good**:
```typescript
it('should display user name when logged in', () => {
  render(<UserProfile user={mockUser} />);
  expect(screen.getByText(mockUser.name)).toBeInTheDocument();
});
```

### 7. Keep Tests Independent

Each test should be able to run independently:

```typescript
// Use beforeEach to reset state
beforeEach(() => {
  // Reset mocks
  vi.clearAllMocks();

  // Reset any global state
});
```

### 8. Use waitFor for Async Operations

```typescript
import { waitFor } from '@testing-library/react';

it('should load data', async () => {
  render(<DataComponent />);

  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

---

## Common Patterns

### Testing Forms

```typescript
it('should submit form with valid data', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();

  render(<LoginForm onSubmit={onSubmit} />);

  // Fill form
  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  await user.type(screen.getByLabelText(/password/i), 'password123');

  // Submit
  await user.click(screen.getByRole('button', { name: /login/i }));

  // Verify
  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});
```

### Testing Loading States

```typescript
it('should show loading spinner', async () => {
  mockDelayedResponse('get', '/api/clients', testClients, 1000);

  render(<ClientList />);

  // Should show loading initially
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  // Wait for data to load
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
});
```

### Testing Error States

```typescript
it('should display error message on fetch failure', async () => {
  mockApiError('get', '/api/clients', 'Server error', 500);

  render(<ClientList />);

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

### Testing Conditional Rendering

```typescript
it('should show admin panel for admin users', () => {
  const adminUser = getAdminUser();
  render(<Dashboard user={adminUser} />);

  expect(screen.getByText(/admin panel/i)).toBeInTheDocument();
});

it('should hide admin panel for regular users', () => {
  const regularUser = getFreeUser();
  render(<Dashboard user={regularUser} />);

  expect(screen.queryByText(/admin panel/i)).not.toBeInTheDocument();
});
```

### Testing Navigation

```typescript
it('should navigate to client detail page', async () => {
  const user = userEvent.setup();

  render(<ClientList />);

  const link = screen.getByText(/view details/i);
  await user.click(link);

  expect(mockRouter.push).toHaveBeenCalledWith('/clients/client-1');
});
```

---

## Troubleshooting

### Common Issues

#### 1. "Cannot find module '@/...'"

Make sure `vitest.config.ts` has the correct path alias:

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
},
```

#### 2. "Element is not in the document"

Use `waitFor` for async operations:

```typescript
await waitFor(() => {
  expect(screen.getByText('Data')).toBeInTheDocument();
});
```

#### 3. "Unable to find element by text"

- Check if text is split across multiple elements
- Use regex for partial matches: `screen.getByText(/partial text/i)`
- Use `screen.debug()` to see the rendered output

#### 4. "Can't perform a React state update on unmounted component"

Clean up async operations in tests:

```typescript
afterEach(() => {
  cleanup();
});
```

#### 5. MSW not intercepting requests

Ensure MSW server is started in `tests/setup.ts`:

```typescript
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Debugging Tests

```typescript
// See rendered HTML
screen.debug();

// See specific element
screen.debug(screen.getByRole('button'));

// Use --reporter=verbose
npm test -- --reporter=verbose

// Run single test file
npm test -- ClientList.test.tsx

// Run tests matching pattern
npm test -- --grep "should login"
```

---

## Code Coverage

Generate coverage report:

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory.

### Coverage Goals

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

Focus on meaningful coverage, not just numbers. Some code (like configuration files) may not need tests.

---

## Writing Your First Test

### Step-by-Step Guide

1. **Identify what to test**
   - What feature are you building?
   - What should it do?

2. **Write the test first (TDD)**
   ```typescript
   it('should do something', () => {
     // Test code here
   });
   ```

3. **Run the test (it should fail)**
   ```bash
   npm test
   ```

4. **Implement the feature**
   ```typescript
   // Your implementation
   ```

5. **Run the test again (it should pass)**
   ```bash
   npm test
   ```

6. **Refactor if needed**
   - Improve code while keeping tests green

---

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [MSW Documentation](https://mswjs.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## Questions?

If you have questions about testing:

1. Check the example tests in `tests/` directory
2. Refer to this guide
3. Check the official documentation
4. Ask your team members

Happy Testing!
