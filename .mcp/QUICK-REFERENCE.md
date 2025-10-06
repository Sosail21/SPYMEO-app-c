# MCP Quick Reference Card

## Installation

```bash
# 1. Install dependencies
cd .mcp && npm install

# 2. Set up environment
cp ../.env.mcp.example ../.env.local
# Edit .env.local with your API keys

# 3. Test servers
npx prisma mcp
npx @stripe/mcp --tools=all
node servers/cloudinary-server.js
```

## Common Commands (Ask Claude)

### Database Operations
```
"Show me the current database schema"
"Create a migration to add [field] to [Model]"
"Generate a query to find all [records] where [condition]"
"Optimize this slow query: [paste query]"
"List all Prisma models"
```

### Storage Operations
```
"Upload [image] to Cloudinary and optimize it"
"Generate a thumbnail URL for [public-id]"
"Search for images in folder [folder-name]"
"Delete asset [public-id]"
"Show Cloudinary folder structure"
```

### Email Operations
```
"Send welcome email to [email]"
"Send appointment confirmation for [appointment-id]"
"Send batch emails to [list]"
"Show verified domains"
```

### Payment Operations
```
"Create a payment intent for [amount] EUR"
"Create a [type] PASS subscription for user [user-id]"
"Refund payment [payment-id]"
"List all Stripe products"
"Show active subscriptions"
```

### Search Operations
```
"Search for [type] in [location]"
"Configure [index-name] index with optimal settings"
"Sync all [model-name] to Algolia"
"List all search indices"
```

## Code Usage

### Database (Prisma)
```typescript
import { getPrismaMCP, query } from '@/lib/mcp/database';

// Read schema
const schema = await getPrismaMCP().readSchema();

// Create migration
await createAndApplyMigration('add_user_avatar');

// Query with builder
const users = await query('User')
  .findMany()
  .where({ role: 'PRACTITIONER' })
  .include({ practitionerProfile: true })
  .execute();
```

### Storage (Cloudinary)
```typescript
import { getCloudinaryMCP, uploadPractitionerProfile } from '@/lib/mcp/storage';

// Upload profile
const { profile, thumbnail } = await uploadPractitionerProfile(
  imageBuffer,
  'practitioner-123'
);

// Generate URL
const url = await getCloudinaryMCP().generateUrl(
  publicId,
  { width: 400, height: 400, crop: 'fill' }
);
```

## MCP Servers

| Server | Command | Purpose |
|--------|---------|---------|
| `prisma-local` | `npx prisma mcp` | Database operations |
| `stripe` | `npx @stripe/mcp --tools=all` | Payment processing |
| `cloudinary` | `node .mcp/servers/cloudinary-server.js` | Media storage |
| `resend` | `node .mcp/servers/resend-server.js` | Email delivery |
| `algolia` | `node .mcp/servers/algolia-server.js` | Search functionality |

## Environment Variables

```bash
DATABASE_URL="postgresql://..."
STRIPE_SECRET_KEY="sk_test_..."
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
RESEND_API_KEY="re_..."
ALGOLIA_APP_ID="..."
ALGOLIA_API_KEY="..."
ALGOLIA_ADMIN_KEY="..."
```

## Integration Patterns

### User Registration
1. Create user (Prisma)
2. Send welcome email (Resend)
3. Index in search (Algolia)

### Practitioner Onboarding
1. Upload profile image (Cloudinary)
2. Create practitioner (Prisma)
3. Index for search (Algolia)
4. Send confirmation (Resend)

### Appointment Booking
1. Create payment intent (Stripe)
2. Save appointment (Prisma)
3. Send confirmations (Resend)

### PASS Subscription
1. Create subscription (Stripe)
2. Update user (Prisma)
3. Send activation email (Resend)

## Troubleshooting

### Server won't connect
```bash
# Check environment variables
echo $DATABASE_URL

# Test server manually
npx prisma mcp

# Check logs
cat .mcp/logs/[server-name].log
```

### Authentication error
- Verify API keys in `.env.local`
- Check key permissions
- Ensure key hasn't expired

### Timeout error
- Increase timeout in `.mcp/config.json`
- Check network connectivity
- Verify service status

## Documentation

- **Main Guide**: `docs/mcp/README.md`
- **Database**: `docs/mcp/database-operations.md`
- **Integration**: `docs/mcp/integration-guide.md`
- **Examples**: `docs/mcp/usage-examples.md`
- **Summary**: `MCP-SETUP-SUMMARY.md`

## Support

1. Review docs in `docs/mcp/`
2. Check `.mcp/README.md`
3. Review logs in `.mcp/logs/`
4. Contact development team

---

**Quick Start**: Copy `.env.mcp.example` → Install deps → Test servers → Use with Claude!
