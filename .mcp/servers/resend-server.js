#!/usr/bin/env node

/**
 * Resend MCP Server Implementation
 *
 * This is a custom MCP server for Resend email operations.
 * It provides tools for sending transactional emails via Resend API.
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');
const { Resend } = require('resend');

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Create MCP server
const server = new Server(
  {
    name: 'resend-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {}
    }
  }
);

// Tool definitions
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'resend:email:send',
        description: 'Send a transactional email via Resend',
        inputSchema: z.object({
          to: z.array(z.string()).describe('Recipient email addresses'),
          from: z.string().describe('Sender email address'),
          subject: z.string().describe('Email subject'),
          html: z.string().optional().describe('HTML email body'),
          text: z.string().optional().describe('Plain text email body'),
          cc: z.array(z.string()).optional(),
          bcc: z.array(z.string()).optional(),
          replyTo: z.string().optional(),
          attachments: z.array(z.object({
            filename: z.string(),
            content: z.string()
          })).optional(),
          tags: z.array(z.object({
            name: z.string(),
            value: z.string()
          })).optional()
        })
      },
      {
        name: 'resend:email:send:batch',
        description: 'Send multiple emails in batch',
        inputSchema: z.object({
          emails: z.array(z.object({
            to: z.array(z.string()),
            from: z.string(),
            subject: z.string(),
            html: z.string().optional(),
            text: z.string().optional()
          }))
        })
      }
    ]
  };
});

// Tool execution handler
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'resend:email:send': {
        const result = await resend.emails.send({
          from: args.from,
          to: args.to,
          subject: args.subject,
          html: args.html,
          text: args.text,
          cc: args.cc,
          bcc: args.bcc,
          reply_to: args.replyTo,
          attachments: args.attachments,
          tags: args.tags
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              id: result.data?.id,
              success: true
            })
          }]
        };
      }

      case 'resend:email:send:batch': {
        const result = await resend.batch.send(args.emails);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              data: result.data,
              success: true
            })
          }]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          error: error.message,
          stack: error.stack
        })
      }],
      isError: true
    };
  }
});

// Resources handler
server.setRequestHandler('resources/list', async () => {
  return {
    resources: [
      {
        uri: 'resend://domains',
        name: 'Verified Domains',
        description: 'List of verified sending domains',
        mimeType: 'application/json'
      }
    ]
  };
});

server.setRequestHandler('resources/read', async (request) => {
  const { uri } = request.params;

  switch (uri) {
    case 'resend://domains': {
      const result = await resend.domains.list();
      return {
        contents: [{
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(result.data)
        }]
      };
    }

    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Resend MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
