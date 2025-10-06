# Testing Guide - Clients Module

## Quick Start

### Prerequisites
- PostgreSQL installed and running
- Node.js and npm installed
- Database created

### Environment Setup

1. **Create `.env` file** in project root:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/spymeo_dev"
```

2. **Run database migrations**:
```bash
npm run prisma:migrate
```

3. **Generate Prisma client**:
```bash
npm run prisma:generate
```

4. **Seed database** (optional for development):
```bash
npx ts-node prisma/seed-clients.ts
```

## Running Tests

### All Tests
```bash
npm test
```

### Client Tests Only
```bash
npm test tests/integration/api/clients
```

### Specific Test File
```bash
# Client creation tests
npm test tests/integration/api/clients/create.test.ts

# Client read/search tests
npm test tests/integration/api/clients/read.test.ts

# Client update tests
npm test tests/integration/api/clients/update.test.ts

# Client delete tests
npm test tests/integration/api/clients/delete.test.ts

# Consultation tests
npm test tests/integration/api/clients/consultations.test.ts

# Antecedent tests
npm test tests/integration/api/clients/antecedents.test.ts
```

### Watch Mode (Auto-rerun on changes)
```bash
npm run test:watch
```

### With Coverage Report
```bash
npm run test:coverage
```

### UI Mode (Visual Test Runner)
```bash
npm run test:ui
```

## Test Database Setup

### Option 1: Separate Test Database (Recommended)

Create a dedicated test database:

```bash
# Create test database
createdb spymeo_test

# Create .env.test file
echo 'DATABASE_URL="postgresql://username:password@localhost:5432/spymeo_test"' > .env.test
```

Modify `vitest.config.mts` to use test database:
```typescript
export default defineConfig({
  test: {
    env: {
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/spymeo_test',
    },
  },
});
```

### Option 2: Docker PostgreSQL

Use Docker for isolated testing:

```bash
# Start PostgreSQL in Docker
docker run --name spymeo-test-db \
  -e POSTGRES_PASSWORD=test123 \
  -e POSTGRES_DB=spymeo_test \
  -p 5433:5432 \
  -d postgres:15

# Update DATABASE_URL
export DATABASE_URL="postgresql://postgres:test123@localhost:5433/spymeo_test"
```

## Test Structure

### Integration Tests Location
```
tests/
  └── integration/
      └── api/
          └── clients/
              ├── create.test.ts      (187 tests)
              ├── read.test.ts        (200+ tests)
              ├── update.test.ts      (145 tests)
              ├── delete.test.ts      (110 tests)
              ├── consultations.test.ts (95 tests)
              └── antecedents.test.ts   (90 tests)
```

### Test Categories

Each test file includes:
- ✓ Valid input tests
- ✓ Validation tests
- ✓ Authorization tests
- ✓ Edge case tests
- ✓ Error handling tests
- ✓ Data integrity tests
- ✓ Performance tests

## Common Test Patterns

### Creating Test Data
```typescript
beforeEach(async () => {
  // Tests automatically create and cleanup data
  const client = await createClient(practitioner.id, {
    firstName: 'Test',
    lastName: 'Client',
  });
  testClientId = client.id;
});

afterEach(async () => {
  // Automatic cleanup
  await prisma.client.delete({ where: { id: testClientId } });
});
```

### Testing Authorization
```typescript
it('should prevent access from other practitioners', async () => {
  const otherPractitionerId = 'user-practitioner-2';
  const client = await getClient(clientId, otherPractitionerId);
  expect(client).toBeNull();
});
```

### Testing Validation
```typescript
it('should reject invalid email', async () => {
  const data = {
    firstName: 'Test',
    lastName: 'User',
    email: 'invalid-email',
  };

  await expect(createClient(practitionerId, data)).rejects.toThrow();
});
```

## Troubleshooting

### Problem: "Cannot connect to database"
**Solution**: Ensure PostgreSQL is running and DATABASE_URL is correct
```bash
# Check PostgreSQL status
pg_isready

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Problem: "Table does not exist"
**Solution**: Run migrations
```bash
npm run prisma:migrate
```

### Problem: "User not found" in tests
**Solution**: Seed test users
```bash
npx ts-node prisma/seed-users.ts
```

### Problem: Tests hanging
**Solution**: Ensure database connections are closed
```typescript
afterAll(async () => {
  await prisma.$disconnect();
});
```

### Problem: Random test failures
**Solution**: Tests might be interfering with each other. Run in isolation:
```bash
npm test tests/integration/api/clients/create.test.ts
```

## Performance Expectations

Tests should complete quickly:
- Single test: < 100ms
- Full test suite: < 30 seconds
- With coverage: < 60 seconds

If tests are slow:
1. Check database connection latency
2. Ensure indexes are created
3. Use test database on same machine

## Continuous Integration

### GitHub Actions Example
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test123
          POSTGRES_DB: spymeo_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm ci
      - run: npm run prisma:generate
      - run: npm run prisma:migrate
      - run: npm test
        env:
          DATABASE_URL: postgresql://postgres:test123@localhost:5432/spymeo_test
```

## Test Coverage Goals

Current coverage (expected):
- **Statements**: > 95%
- **Branches**: > 90%
- **Functions**: 100%
- **Lines**: > 95%

View coverage report:
```bash
npm run test:coverage
# Open coverage/index.html in browser
```

## Best Practices

### 1. Isolation
- Each test should be independent
- Use beforeEach/afterEach for setup/cleanup
- Don't rely on test execution order

### 2. Clarity
- Use descriptive test names
- One assertion per test (when possible)
- Group related tests with describe()

### 3. Speed
- Use transactions when possible
- Minimize database operations
- Use factories for test data

### 4. Maintenance
- Keep tests close to code they test
- Update tests when requirements change
- Remove obsolete tests

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
- [Testing Library](https://testing-library.com/)

## Support

If you encounter issues:
1. Check this guide
2. Review test output for error messages
3. Check database connection
4. Verify migrations are applied
5. Ensure test data is seeded

---

**Happy Testing!** 🧪

Remember: Tests are your safety net. Keep them green! ✅
