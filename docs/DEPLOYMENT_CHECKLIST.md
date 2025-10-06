# Clients Module Deployment Checklist

## Pre-Deployment

### 1. Database Setup
- [ ] PostgreSQL database created
- [ ] Database connection string added to `.env`
- [ ] Database migrations run successfully
- [ ] Prisma client generated

```bash
# Verify database connection
psql $DATABASE_URL -c "SELECT version();"

# Run migrations
npm run prisma:migrate

# Generate client
npm run prisma:generate
```

### 2. Dependencies
- [ ] All npm packages installed
- [ ] Prisma CLI installed
- [ ] @prisma/client installed
- [ ] Zod installed

```bash
npm install
```

### 3. Environment Variables
- [ ] `DATABASE_URL` set correctly
- [ ] Connection string includes all required parameters
- [ ] SSL mode configured (if production)

Example `.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
NODE_ENV="production"
```

## Testing Phase

### 1. Run Test Suite
- [ ] All client creation tests pass (187 tests)
- [ ] All client read tests pass (200+ tests)
- [ ] All client update tests pass (145 tests)
- [ ] All client delete tests pass (110 tests)
- [ ] All consultation tests pass (95 tests)
- [ ] All antecedent tests pass (90 tests)

```bash
npm test tests/integration/api/clients
```

### 2. Verify Coverage
- [ ] Statement coverage > 95%
- [ ] Branch coverage > 90%
- [ ] Function coverage = 100%

```bash
npm run test:coverage
```

### 3. Manual Testing
- [ ] Can create a client via API
- [ ] Can retrieve client list
- [ ] Can search clients
- [ ] Can update client
- [ ] Can delete client
- [ ] Can add consultations
- [ ] Can add antecedents
- [ ] Authorization works correctly

## Deployment Steps

### 1. Code Preparation
- [ ] All tests passing
- [ ] No console.log statements in production code
- [ ] Error handling complete
- [ ] TypeScript compilation successful

```bash
npm run build
```

### 2. Database Migration (Production)
- [ ] Backup production database
- [ ] Test migration on staging first
- [ ] Run migration during low-traffic window
- [ ] Verify migration success

```bash
# Backup first!
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Run migration
npm run prisma:migrate deploy
```

### 3. Seed Data (Optional)
- [ ] Decide if seeding is needed
- [ ] Review seed script for production suitability
- [ ] Run seed script if appropriate

```bash
# Only if needed in production
npx ts-node prisma/seed-clients.ts
```

### 4. Service Deployment
- [ ] Build application
- [ ] Deploy to server/cloud
- [ ] Verify environment variables
- [ ] Check application logs

```bash
npm run build
npm start
```

## Post-Deployment

### 1. Smoke Tests
- [ ] API endpoints responding
- [ ] Can create a test client
- [ ] Can retrieve test client
- [ ] Can delete test client
- [ ] Response times acceptable

### 2. Monitoring
- [ ] Set up error logging
- [ ] Monitor API response times
- [ ] Track database query performance
- [ ] Set up alerts for failures

### 3. Documentation
- [ ] API documentation updated
- [ ] Team notified of changes
- [ ] Migration guide shared
- [ ] Support team briefed

## Rollback Plan

If issues occur:

### 1. Immediate Actions
- [ ] Stop accepting new requests
- [ ] Assess impact
- [ ] Communicate to stakeholders

### 2. Rollback Steps
```bash
# Restore previous code version
git revert <commit-hash>

# Rollback database migration (if needed)
npm run prisma:migrate resolve --rolled-back <migration-name>

# Restore database from backup (worst case)
psql $DATABASE_URL < backup_YYYYMMDD.sql
```

### 3. Recovery Verification
- [ ] Application functioning
- [ ] No data loss
- [ ] Users can access system
- [ ] Logs reviewed

## Performance Benchmarks

Verify these metrics post-deployment:

- [ ] Client creation: < 200ms
- [ ] Client retrieval: < 100ms
- [ ] Client search: < 300ms
- [ ] List operations: < 500ms
- [ ] Database queries: < 50ms

## Security Checklist

- [ ] Authentication required for all endpoints
- [ ] Authorization checks in place
- [ ] SQL injection prevented (using Prisma)
- [ ] XSS protection enabled
- [ ] Rate limiting configured
- [ ] Sensitive data encrypted
- [ ] HTTPS enforced in production

## Compliance Checklist

- [ ] GDPR compliance verified (if applicable)
- [ ] Data retention policy implemented
- [ ] Audit logging enabled
- [ ] Backup strategy in place
- [ ] Privacy policy updated

## Known Issues & Limitations

Document any known issues:

1. **Issue**: None currently
2. **Limitation**: Pagination limit max 100 items
3. **Workaround**: None needed

## Support Contacts

- **Developer**: [Your contact]
- **Database Admin**: [DBA contact]
- **DevOps**: [DevOps contact]
- **On-Call**: [On-call contact]

## Timeline

- **Development Complete**: 2025-10-06
- **Testing Complete**: [Date]
- **Staging Deployment**: [Date]
- **Production Deployment**: [Date]
- **Post-Deployment Review**: [Date + 1 week]

## Sign-Off

- [ ] Developer approval
- [ ] QA approval
- [ ] Product Owner approval
- [ ] Technical Lead approval

---

## Quick Commands Reference

### Development
```bash
npm run dev                  # Start dev server
npm test                     # Run tests
npm run test:watch          # Watch mode
npm run prisma:studio       # Open Prisma Studio
```

### Database
```bash
npm run prisma:generate     # Generate Prisma client
npm run prisma:migrate      # Run migrations
npx prisma migrate reset    # Reset database (DEV ONLY)
npx prisma db push          # Push schema changes
```

### Production
```bash
npm run build               # Build application
npm start                   # Start production server
npm run prisma:migrate deploy # Deploy migrations
```

## Notes

- All tests must pass before deployment
- Database backups are mandatory
- Rollback plan must be ready
- Monitor closely for first 48 hours

---

**Deployment Status**: ⏳ PENDING DATABASE SETUP

Once database is configured and tests pass, this module is ready for production deployment.
