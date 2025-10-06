# SPYMEO Model Context Protocol (MCP) Setup

## Overview

This document provides a comprehensive guide to the Model Context Protocol (MCP) setup for the SPYMEO wellness platform. MCP enables AI-assisted development by connecting Claude and other AI assistants to external services and data sources.

## What is MCP?

The Model Context Protocol (MCP) is an open standard created by Anthropic that allows AI assistants to securely connect to various data sources and tools. Think of MCP as a "USB-C port for AI applications" - it provides a standardized way to connect AI models to:

- Databases (Prisma)
- File storage systems (Cloudinary)
- Email services (Resend)
- Payment platforms (Stripe)
- Search engines (Algolia)
- Version control (GitHub)
- And much more

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Claude Code / AI                   │
│              (MCP Client Application)                │
└──────────────────────┬──────────────────────────────┘
                       │
                       │ MCP Protocol
                       │
┌──────────────────────┴──────────────────────────────┐
│              MCP Configuration Layer                 │
│                  (.mcp/config.json)                  │
└──────────────────────┬──────────────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
┌──────▼──────┐ ┌─────▼─────┐ ┌──────▼──────┐
│   Prisma    │ │  Stripe   │ │ Cloudinary  │
│ MCP Server  │ │MCP Server │ │ MCP Server  │
└──────┬──────┘ └─────┬─────┘ └──────┬──────┘
       │              │              │
┌──────▼──────┐ ┌─────▼─────┐ ┌──────▼──────┐
│  Database   │ │  Stripe   │ │ Cloudinary  │
│  (Prisma)   │ │    API    │ │     API     │
└─────────────┘ └───────────┘ └─────────────┘
```

## MCP Servers Configured

SPYMEO uses the following MCP servers:

### 1. **Prisma Database Server** (`prisma-local`)
- **Purpose**: Database operations, schema management, migrations
- **Capabilities**: Query execution, schema generation, migration creation
- **Configuration**: `.mcp/servers/database.json`
- **Documentation**: [Database Operations Guide](./database-operations.md)

### 2. **Stripe Payment Server** (`stripe`)
- **Purpose**: Payment processing, subscription management
- **Capabilities**: Payment creation, refunds, customer management, subscriptions
- **Configuration**: `.mcp/servers/payment.json`

### 3. **Cloudinary Storage Server** (`cloudinary`)
- **Purpose**: File storage, image optimization, media management
- **Capabilities**: Upload, transform, delete, search media assets
- **Configuration**: `.mcp/servers/storage.json`

### 4. **Resend Email Server** (`resend`)
- **Purpose**: Transactional email delivery
- **Capabilities**: Send emails, batch sending, template rendering
- **Configuration**: `.mcp/servers/email.json`

### 5. **Algolia Search Server** (`algolia`)
- **Purpose**: Full-text search across practitioners, products, articles
- **Capabilities**: Index management, search queries, faceted search
- **Configuration**: `.mcp/servers/search.json`

### 6. **GitHub Server** (`github`)
- **Purpose**: Repository operations, issue management
- **Capabilities**: File operations, PR creation, issue tracking

### 7. **Filesystem Server** (`filesystem`)
- **Purpose**: Local file system operations
- **Capabilities**: Read, write, search local files

## Installation & Setup

### Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager
- Claude Desktop or Claude Code CLI
- Environment variables configured

### Step 1: Install MCP Dependencies

```bash
# Install Prisma MCP server (if not using npx)
npm install -g prisma

# Install Stripe MCP server (if not using npx)
npm install -g @stripe/mcp

# Other MCP servers will be invoked via npx on-demand
```

### Step 2: Configure Environment Variables

Create or update your `.env.local` file with the following:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/spymeo"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Resend
RESEND_API_KEY="re_..."

# Algolia
ALGOLIA_APP_ID="your-app-id"
ALGOLIA_API_KEY="your-search-api-key"
ALGOLIA_ADMIN_KEY="your-admin-api-key"

# GitHub
GITHUB_PERSONAL_ACCESS_TOKEN="ghp_..."

# Project
PROJECT_ROOT="/path/to/spymeo"
```

### Step 3: Configure Claude Desktop (Optional)

If using Claude Desktop, add the MCP configuration to your Claude Desktop config:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "prisma-local": {
      "command": "npx",
      "args": ["-y", "prisma", "mcp"],
      "env": {
        "DATABASE_URL": "your-database-url"
      }
    },
    "stripe": {
      "command": "npx",
      "args": ["-y", "@stripe/mcp", "--tools=all"],
      "env": {
        "STRIPE_SECRET_KEY": "your-stripe-key"
      }
    }
  }
}
```

### Step 4: Configure Claude Code CLI

If using Claude Code CLI, add MCP servers:

```bash
# Add Prisma MCP server
claude mcp add prisma-local

# Add Stripe MCP server
claude mcp add stripe

# List configured MCP servers
claude mcp list
```

### Step 5: Verify Installation

Test that MCP servers are working:

```bash
# Test Prisma MCP
npx prisma mcp --help

# Test Stripe MCP
npx @stripe/mcp --help
```

## Usage Examples

### Database Operations with Prisma MCP

```
Ask Claude: "Show me the current database schema"
Ask Claude: "Create a migration to add an 'avatar' field to the User model"
Ask Claude: "Generate a Prisma query to find all practitioners in Paris"
```

### Payment Operations with Stripe MCP

```
Ask Claude: "Create a payment intent for 50 EUR"
Ask Claude: "List all active subscriptions"
Ask Claude: "Create a refund for payment pi_123456"
```

### Storage Operations with Cloudinary MCP

```
Ask Claude: "Upload profile.jpg to the practitioners folder"
Ask Claude: "Generate a thumbnail URL for practitioner/john-doe"
Ask Claude: "Search for all images in the products folder"
```

### Email Operations with Resend MCP

```
Ask Claude: "Send a welcome email to user@example.com"
Ask Claude: "Send appointment confirmation for booking #123"
```

### Search Operations with Algolia MCP

```
Ask Claude: "Search for yoga practitioners in Paris"
Ask Claude: "Configure the practitioners index with optimal settings"
Ask Claude: "Sync all practitioners from database to Algolia"
```

## MCP Primitives

MCP provides three main primitives for interaction:

### 1. Tools (Model-Controlled)
Functions that the AI can invoke to perform actions:
- `prisma:migration:create` - Create database migration
- `stripe:payment:create` - Create payment
- `cloudinary:upload:image` - Upload image
- `resend:email:send` - Send email

### 2. Resources (App-Controlled)
Data sources that the AI can read:
- `prisma://schema` - Current database schema
- `stripe://products` - Stripe products
- `cloudinary://folders` - Folder structure
- `algolia://indices` - Search indices

### 3. Prompts (User-Controlled)
Pre-defined conversation starters:
- "Create a new database migration"
- "Set up a PASS subscription"
- "Upload and optimize profile images"

## Security Best Practices

### 1. Authentication
- All MCP servers require authentication via API keys
- Never commit API keys to version control
- Use environment variables for all secrets
- Rotate API keys regularly

### 2. Authorization
- MCP servers are configured with least-privilege access
- Read-only operations where possible
- Separate keys for development and production

### 3. Rate Limiting
- MCP configuration includes rate limiting (60 requests/minute)
- Prevents accidental API abuse
- Protects against runaway AI operations

### 4. Allowed Origins
- MCP accepts connections only from trusted origins
- Claude.ai and localhost:3000 by default
- Configure additional origins as needed

### 5. Webhook Security
- Stripe webhooks use signature verification
- Always validate webhook signatures
- Use HTTPS for webhook endpoints

## Troubleshooting

### MCP Server Not Found

**Problem**: Claude cannot connect to MCP server

**Solution**:
```bash
# Verify npx can run the server
npx -y prisma mcp

# Check environment variables are set
echo $DATABASE_URL

# Restart Claude Desktop/Code
```

### Authentication Errors

**Problem**: MCP server returns 401 Unauthorized

**Solution**:
- Verify API keys in `.env.local`
- Check that environment variables are loaded
- Ensure keys have not expired or been revoked

### Timeout Errors

**Problem**: MCP operations time out

**Solution**:
- Increase timeout in `.mcp/config.json` (default: 30000ms)
- Check network connectivity
- Verify external service is not down

### Permission Errors

**Problem**: MCP server cannot access resources

**Solution**:
- Check API key permissions/scopes
- Verify database user has required privileges
- Review MCP server configuration

## Advanced Configuration

### Custom MCP Servers

Create custom MCP servers for SPYMEO-specific operations:

```javascript
// .mcp/servers/custom-server.js
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: 'spymeo-custom',
  version: '1.0.0',
});

// Define custom tools
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'spymeo:calculate-pass-discount',
        description: 'Calculate PASS discount for a service',
        inputSchema: {
          type: 'object',
          properties: {
            servicePrice: { type: 'number' },
            passType: { type: 'string' }
          }
        }
      }
    ]
  };
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Caching

MCP supports caching for improved performance:

```json
{
  "settings": {
    "enableCaching": true,
    "cacheDirectory": ".mcp/cache",
    "cacheTTL": 3600
  }
}
```

### Parallel Execution

For advanced use cases, enable parallel tool execution:

```json
{
  "features": {
    "parallelExecution": true
  }
}
```

**Warning**: Only enable if you understand the implications for data consistency.

## Integration with Development Workflow

### 1. Automated Database Migrations

Use MCP to streamline migration workflow:

```
Developer: "I need to add email verification to users"
Claude: "I'll create a migration adding 'emailVerified' and 'verificationToken' fields"
[Claude uses Prisma MCP to create and apply migration]
```

### 2. Code Generation from Specs

Generate boilerplate code using MCP:

```
Developer: "Create a CRUD API for blog articles"
Claude: "I'll generate the Prisma schema, API routes, and types"
[Claude uses multiple MCP servers to scaffold the feature]
```

### 3. API Endpoint Scaffolding

Quickly create new endpoints:

```
Developer: "Create an endpoint to search practitioners by specialty"
Claude: [Uses Prisma MCP for query, Algolia MCP for search, generates API route]
```

### 4. Test Generation

Generate tests based on implementation:

```
Developer: "Generate tests for the payment flow"
Claude: [Uses Stripe MCP to understand payment logic, generates comprehensive tests]
```

## Resources

- [Official MCP Documentation](https://modelcontextprotocol.io)
- [Anthropic MCP Announcement](https://www.anthropic.com/news/model-context-protocol)
- [MCP GitHub Repository](https://github.com/modelcontextprotocol)
- [Prisma MCP Server](https://www.prisma.io/docs/postgres/integrations/mcp-server)
- [Stripe MCP Server](https://docs.stripe.com/mcp)
- [MCP Best Practices Course](https://anthropic.skilljar.com/introduction-to-model-context-protocol)

## Support

For issues with MCP setup:

1. Check this documentation
2. Review [Integration Guide](./integration-guide.md)
3. Consult [Database Operations Guide](./database-operations.md)
4. Check MCP server logs in `.mcp/logs/`
5. Contact the development team

## License

This MCP configuration is part of the SPYMEO project and follows the same license.
