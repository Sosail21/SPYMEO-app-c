#!/usr/bin/env node

/**
 * Cloudinary MCP Server Implementation
 *
 * This is a custom MCP server for Cloudinary operations.
 * It provides tools for uploading, transforming, and managing media assets.
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');

// Cloudinary SDK
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Create MCP server
const server = new Server(
  {
    name: 'cloudinary-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {}
    }
  }
);

// Tool: Upload Image
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'cloudinary:upload:image',
        description: 'Upload an image to Cloudinary',
        inputSchema: z.object({
          file: z.string().describe('File path or data URI'),
          folder: z.string().optional().describe('Folder path'),
          publicId: z.string().optional().describe('Custom public ID'),
          tags: z.array(z.string()).optional().describe('Tags for the asset'),
          transformation: z.object({
            width: z.number().optional(),
            height: z.number().optional(),
            crop: z.string().optional(),
            quality: z.string().optional(),
            format: z.string().optional()
          }).optional()
        })
      },
      {
        name: 'cloudinary:upload:document',
        description: 'Upload a document to Cloudinary',
        inputSchema: z.object({
          file: z.string().describe('File path or data URI'),
          folder: z.string().optional(),
          publicId: z.string().optional(),
          resourceType: z.enum(['raw', 'auto']).default('raw')
        })
      },
      {
        name: 'cloudinary:transform:image',
        description: 'Transform an existing image',
        inputSchema: z.object({
          publicId: z.string(),
          transformation: z.object({
            width: z.number().optional(),
            height: z.number().optional(),
            crop: z.string().optional(),
            quality: z.string().optional(),
            format: z.string().optional()
          })
        })
      },
      {
        name: 'cloudinary:delete:asset',
        description: 'Delete an asset from Cloudinary',
        inputSchema: z.object({
          publicId: z.string(),
          resourceType: z.enum(['image', 'video', 'raw']).default('image')
        })
      },
      {
        name: 'cloudinary:search:assets',
        description: 'Search for assets in Cloudinary',
        inputSchema: z.object({
          expression: z.string(),
          maxResults: z.number().default(50),
          sortBy: z.array(z.object({})).optional()
        })
      },
      {
        name: 'cloudinary:url:generate',
        description: 'Generate an optimized URL for an asset',
        inputSchema: z.object({
          publicId: z.string(),
          transformation: z.object({}).optional(),
          secure: z.boolean().default(true)
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
      case 'cloudinary:upload:image': {
        const result = await cloudinary.uploader.upload(args.file, {
          folder: args.folder,
          public_id: args.publicId,
          tags: args.tags,
          transformation: args.transformation
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              publicId: result.public_id,
              secureUrl: result.secure_url,
              url: result.url,
              format: result.format,
              width: result.width,
              height: result.height,
              bytes: result.bytes
            })
          }]
        };
      }

      case 'cloudinary:upload:document': {
        const result = await cloudinary.uploader.upload(args.file, {
          folder: args.folder,
          public_id: args.publicId,
          resource_type: args.resourceType || 'raw'
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              publicId: result.public_id,
              secureUrl: result.secure_url,
              url: result.url,
              format: result.format,
              bytes: result.bytes
            })
          }]
        };
      }

      case 'cloudinary:delete:asset': {
        const result = await cloudinary.uploader.destroy(args.publicId, {
          resource_type: args.resourceType || 'image'
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ result: result.result })
          }]
        };
      }

      case 'cloudinary:search:assets': {
        const result = await cloudinary.search
          .expression(args.expression)
          .max_results(args.maxResults || 50)
          .sort_by(...(args.sortBy || []))
          .execute();

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ assets: result.resources })
          }]
        };
      }

      case 'cloudinary:url:generate': {
        const url = cloudinary.url(args.publicId, {
          ...args.transformation,
          secure: args.secure !== false
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ url })
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
        uri: 'cloudinary://folders',
        name: 'Folder Structure',
        description: 'Current folder organization in Cloudinary',
        mimeType: 'application/json'
      },
      {
        uri: 'cloudinary://usage',
        name: 'Storage Usage',
        description: 'Current storage and bandwidth usage',
        mimeType: 'application/json'
      }
    ]
  };
});

server.setRequestHandler('resources/read', async (request) => {
  const { uri } = request.params;

  switch (uri) {
    case 'cloudinary://folders': {
      const result = await cloudinary.api.root_folders();
      return {
        contents: [{
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(result.folders)
        }]
      };
    }

    case 'cloudinary://usage': {
      const result = await cloudinary.api.usage();
      return {
        contents: [{
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(result)
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
  console.error('Cloudinary MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
