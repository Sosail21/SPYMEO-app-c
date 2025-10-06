# MCP Server Configuration

This directory contains the Model Context Protocol (MCP) server configurations for the SPYMEO platform.

## Directory Structure

```
.mcp/
├── config.json                 # Main MCP configuration
├── servers/                    # Server-specific configurations
│   ├── database.json          # Prisma database server config
│   ├── storage.json           # Cloudinary storage server config
│   ├── email.json             # Resend email server config
│   ├── payment.json           # Stripe payment server config
│   ├── search.json            # Algolia search server config
│   ├── cloudinary-server.js   # Custom Cloudinary MCP server
│   ├── resend-server.js       # Custom Resend MCP server
│   └── algolia-server.js      # Custom Algolia MCP server
├── cache/                      # MCP cache directory (auto-generated)
└── logs/                       # MCP server logs (auto-generated)
```

## Server Configurations

### Active MCP Servers

1. **prisma-local** - Database operations via Prisma
2. **stripe** - Payment processing via Stripe
3. **cloudinary** - Media storage via Cloudinary
4. **resend** - Email delivery via Resend
5. **algolia** - Search functionality via Algolia
6. **github** - Repository operations via GitHub
7. **filesystem** - Local file operations

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install @modelcontextprotocol/sdk
   npm install cloudinary resend algoliasearch
   ```

2. **Configure environment variables**:
   ```bash
   cp ../.env.mcp.example ../.env.local
   # Edit .env.local with your API keys
   ```

3. **Test MCP servers**:
   ```bash
   # Test Prisma MCP
   npx prisma mcp

   # Test Stripe MCP
   npx @stripe/mcp --tools=all

   # Test custom servers
   node .mcp/servers/cloudinary-server.js
   ```

4. **Configure Claude Desktop** (optional):

   Add to your Claude Desktop config:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

   ```json
   {
     "mcpServers": {
       "prisma-local": {
         "command": "npx",
         "args": ["-y", "prisma", "mcp"],
         "env": {
           "DATABASE_URL": "your-database-url"
         }
       }
     }
   }
   ```

## Using MCP Servers

### From Claude Desktop

Ask Claude to perform operations:

```
"Show me the current database schema"
"Create a migration to add an avatar field to User"
"Upload this image to Cloudinary and optimize it"
"Send a welcome email to user@example.com"
"Search for yoga practitioners in Paris"
```

### From Code

Use the MCP client wrapper:

```typescript
import { getPrismaMCP } from '@/lib/mcp/database';
import { getCloudinaryMCP } from '@/lib/mcp/storage';

// Database operations
const schema = await getPrismaMCP().readSchema();
await createAndApplyMigration('add_user_avatar');

// Storage operations
const { profile, thumbnail } = await uploadPractitionerProfile(
  imageBuffer,
  'practitioner-123'
);
```

## Server Details

### Prisma (Database)

- **Command**: `npx prisma mcp`
- **Tools**: Schema operations, migrations, queries
- **Resources**: Schema, migrations, models
- **Config**: `.mcp/servers/database.json`

### Stripe (Payments)

- **Command**: `npx @stripe/mcp --tools=all`
- **Tools**: Payments, subscriptions, customers, invoices
- **Resources**: Products, prices, customers
- **Config**: `.mcp/servers/payment.json`

### Cloudinary (Storage)

- **Command**: `node .mcp/servers/cloudinary-server.js`
- **Tools**: Upload, transform, delete, search
- **Resources**: Folders, usage stats
- **Config**: `.mcp/servers/storage.json`

### Resend (Email)

- **Command**: `node .mcp/servers/resend-server.js`
- **Tools**: Send email, batch send
- **Resources**: Domains, templates
- **Config**: `.mcp/servers/email.json`

### Algolia (Search)

- **Command**: `node .mcp/servers/algolia-server.js`
- **Tools**: Search, index, configure settings
- **Resources**: Indices, analytics
- **Config**: `.mcp/servers/search.json`

## Security

- All servers require authentication via environment variables
- API keys are never stored in configuration files
- Use `.env.local` for local development
- Use secure environment variables in production
- Enable rate limiting in production
- Rotate API keys regularly

## Troubleshooting

### Server won't start

```bash
# Check environment variables
echo $DATABASE_URL

# Check server command
npx prisma mcp

# Check logs
cat .mcp/logs/prisma-local.log
```

### Authentication errors

- Verify API keys in `.env.local`
- Check key permissions/scopes
- Ensure keys haven't expired

### Connection timeouts

- Increase timeout in `config.json`
- Check network connectivity
- Verify service is not down

## Development

### Creating Custom MCP Servers

1. Create a new server file in `.mcp/servers/`
2. Implement the MCP protocol
3. Add configuration to `config.json`
4. Document in server-specific JSON config

Example:

```javascript
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');

const server = new Server({
  name: 'custom-server',
  version: '1.0.0'
});

// Define tools, resources, prompts
server.setRequestHandler('tools/list', async () => {
  // Return available tools
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

## Documentation

- [Main MCP Documentation](../docs/mcp/README.md)
- [Database Operations Guide](../docs/mcp/database-operations.md)
- [Integration Guide](../docs/mcp/integration-guide.md)
- [Official MCP Docs](https://modelcontextprotocol.io)

## Support

For issues with MCP configuration:
1. Check server logs in `.mcp/logs/`
2. Review documentation in `docs/mcp/`
3. Test individual servers manually
4. Contact the development team

## License

Part of the SPYMEO project. See main LICENSE file.
