# MCP Setup Checklist

Use this checklist to verify your MCP setup is complete and working.

## ✅ Installation Checklist

### 1. Files Created

- [ ] `.mcp/config.json` - Main MCP configuration
- [ ] `.mcp/package.json` - MCP server dependencies
- [ ] `.mcp/README.md` - MCP directory documentation
- [ ] `.mcp/servers/database.json` - Prisma configuration
- [ ] `.mcp/servers/storage.json` - Cloudinary configuration
- [ ] `.mcp/servers/email.json` - Resend configuration
- [ ] `.mcp/servers/payment.json` - Stripe configuration
- [ ] `.mcp/servers/search.json` - Algolia configuration
- [ ] `.mcp/servers/cloudinary-server.js` - Custom server
- [ ] `.mcp/servers/resend-server.js` - Custom server
- [ ] `.mcp/servers/algolia-server.js` - Custom server
- [ ] `docs/mcp/README.md` - Main documentation
- [ ] `docs/mcp/database-operations.md` - Database guide
- [ ] `docs/mcp/integration-guide.md` - Integration patterns
- [ ] `docs/mcp/usage-examples.md` - Usage examples
- [ ] `src/lib/mcp/client.ts` - MCP client wrapper
- [ ] `src/lib/mcp/database.ts` - Database operations
- [ ] `src/lib/mcp/storage.ts` - Storage operations
- [ ] `.env.mcp.example` - Environment template
- [ ] `MCP-SETUP-SUMMARY.md` - Complete summary

### 2. Environment Configuration

- [ ] Copy `.env.mcp.example` to `.env.local`
- [ ] Set `DATABASE_URL`
- [ ] Set `STRIPE_SECRET_KEY`
- [ ] Set `STRIPE_PUBLISHABLE_KEY`
- [ ] Set `STRIPE_WEBHOOK_SECRET`
- [ ] Set `CLOUDINARY_CLOUD_NAME`
- [ ] Set `CLOUDINARY_API_KEY`
- [ ] Set `CLOUDINARY_API_SECRET`
- [ ] Set `RESEND_API_KEY`
- [ ] Set `ALGOLIA_APP_ID`
- [ ] Set `ALGOLIA_API_KEY`
- [ ] Set `ALGOLIA_ADMIN_KEY`
- [ ] Set `NEXT_PUBLIC_URL`
- [ ] Set `PROJECT_ROOT`

### 3. Dependencies Installation

- [ ] Run `cd .mcp && npm install`
- [ ] Install `@modelcontextprotocol/sdk`
- [ ] Install `cloudinary`
- [ ] Install `resend`
- [ ] Install `algoliasearch`
- [ ] Install `zod`

### 4. Server Testing

- [ ] Test Prisma: `npx prisma mcp`
- [ ] Test Stripe: `npx @stripe/mcp --tools=all`
- [ ] Test Cloudinary: `node .mcp/servers/cloudinary-server.js`
- [ ] Test Resend: `node .mcp/servers/resend-server.js`
- [ ] Test Algolia: `node .mcp/servers/algolia-server.js`

### 5. Claude Desktop Configuration (Optional)

- [ ] Locate Claude Desktop config file
  - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
  - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- [ ] Add Prisma MCP server
- [ ] Add Stripe MCP server
- [ ] Add custom servers as needed
- [ ] Restart Claude Desktop

## ✅ Functionality Tests

### Database (Prisma)

- [ ] Ask Claude to show database schema
- [ ] Create a test migration
- [ ] Execute a test query
- [ ] List all models

**Test Commands:**
```
"Show me the current database schema"
"List all Prisma models"
"Validate the Prisma schema"
```

### Storage (Cloudinary)

- [ ] Upload a test image
- [ ] Generate transformation URLs
- [ ] Search for assets
- [ ] View folder structure

**Test Commands:**
```
"Show me the Cloudinary folder structure"
"Generate a 400x400 thumbnail URL for test-image"
```

### Email (Resend)

- [ ] Check domain verification
- [ ] Send a test email
- [ ] View email templates

**Test Commands:**
```
"Show me verified domains in Resend"
"Send a test email to test@example.com"
```

### Payment (Stripe)

- [ ] List products
- [ ] Check customer count
- [ ] View subscriptions

**Test Commands:**
```
"List all Stripe products"
"Show active subscriptions"
```

### Search (Algolia)

- [ ] List indices
- [ ] Perform test search
- [ ] View index settings

**Test Commands:**
```
"List all Algolia indices"
"Search for practitioners in Paris"
```

## ✅ Integration Tests

### User Registration Flow

- [ ] Database user creation works
- [ ] Welcome email sends
- [ ] Profile data stored

### Practitioner Onboarding

- [ ] Image upload works
- [ ] Database record created
- [ ] Search index updated
- [ ] Email notification sent

### Appointment Booking

- [ ] Payment intent created
- [ ] Appointment saved
- [ ] Confirmation emails sent

### PASS Subscription

- [ ] Stripe subscription created
- [ ] Database updated
- [ ] Activation email sent

## ✅ Security Verification

- [ ] API keys in `.env.local` only
- [ ] `.env.local` in `.gitignore`
- [ ] No hardcoded secrets in code
- [ ] Different keys for dev/production
- [ ] Webhook secrets configured
- [ ] HTTPS enabled for production

## ✅ Documentation Review

- [ ] Read `docs/mcp/README.md`
- [ ] Review `docs/mcp/database-operations.md`
- [ ] Study `docs/mcp/integration-guide.md`
- [ ] Try examples from `docs/mcp/usage-examples.md`
- [ ] Review `MCP-SETUP-SUMMARY.md`

## ✅ Team Onboarding

- [ ] Share `MCP-SETUP-SUMMARY.md` with team
- [ ] Provide `.env.mcp.example` template
- [ ] Document team-specific patterns
- [ ] Set up shared Claude Desktop configs
- [ ] Train team on MCP usage

## 🚀 Ready for Production

Once all items are checked, your MCP setup is complete and ready for use!

### Quick Start Commands

```bash
# Install MCP dependencies
cd .mcp && npm install

# Test all servers
npx prisma mcp
npx @stripe/mcp --tools=all
node .mcp/servers/cloudinary-server.js

# Use in development
# Ask Claude: "Show me the database schema"
# Ask Claude: "Create a migration to add phone to User"
```

### Get Help

- Review documentation in `docs/mcp/`
- Check `.mcp/README.md`
- Review logs in `.mcp/logs/`
- Contact development team

---

**Setup Date**: _____________
**Verified By**: _____________
**Status**: [ ] Complete [ ] In Progress [ ] Issues
