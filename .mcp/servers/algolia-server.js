#!/usr/bin/env node

/**
 * Algolia MCP Server Implementation
 *
 * This is a custom MCP server for Algolia search operations.
 * It provides tools for searching, indexing, and managing search data.
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');
const algoliasearch = require('algoliasearch');

// Initialize Algolia
const client = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_ADMIN_KEY
);

// Create MCP server
const server = new Server(
  {
    name: 'algolia-mcp',
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
        name: 'algolia:search:query',
        description: 'Search across an index',
        inputSchema: z.object({
          indexName: z.string(),
          query: z.string(),
          filters: z.string().optional(),
          facets: z.array(z.string()).optional(),
          hitsPerPage: z.number().default(20),
          page: z.number().default(0),
          attributesToRetrieve: z.array(z.string()).optional(),
          getRankingInfo: z.boolean().default(false)
        })
      },
      {
        name: 'algolia:record:add',
        description: 'Add a record to an index',
        inputSchema: z.object({
          indexName: z.string(),
          record: z.object({}).passthrough()
        })
      },
      {
        name: 'algolia:record:update',
        description: 'Update a record in an index',
        inputSchema: z.object({
          indexName: z.string(),
          objectID: z.string(),
          updates: z.object({}).passthrough()
        })
      },
      {
        name: 'algolia:record:delete',
        description: 'Delete a record from an index',
        inputSchema: z.object({
          indexName: z.string(),
          objectID: z.string()
        })
      },
      {
        name: 'algolia:record:batch',
        description: 'Perform batch operations on records',
        inputSchema: z.object({
          indexName: z.string(),
          operations: z.array(z.object({
            action: z.enum(['addObject', 'updateObject', 'deleteObject']),
            body: z.object({}).passthrough()
          }))
        })
      },
      {
        name: 'algolia:settings:configure',
        description: 'Configure index settings',
        inputSchema: z.object({
          indexName: z.string(),
          settings: z.object({
            searchableAttributes: z.array(z.string()).optional(),
            attributesForFaceting: z.array(z.string()).optional(),
            customRanking: z.array(z.string()).optional(),
            ranking: z.array(z.string()).optional()
          })
        })
      }
    ]
  };
});

// Tool execution handler
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const index = client.initIndex(args.indexName);

    switch (name) {
      case 'algolia:search:query': {
        const result = await index.search(args.query, {
          filters: args.filters,
          facets: args.facets,
          hitsPerPage: args.hitsPerPage || 20,
          page: args.page || 0,
          attributesToRetrieve: args.attributesToRetrieve,
          getRankingInfo: args.getRankingInfo || false
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              hits: result.hits,
              facets: result.facets,
              nbHits: result.nbHits,
              page: result.page,
              nbPages: result.nbPages
            })
          }]
        };
      }

      case 'algolia:record:add': {
        const result = await index.saveObject(args.record);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ objectID: result.objectID })
          }]
        };
      }

      case 'algolia:record:update': {
        const result = await index.partialUpdateObject({
          objectID: args.objectID,
          ...args.updates
        });
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ objectID: result.objectID })
          }]
        };
      }

      case 'algolia:record:delete': {
        await index.deleteObject(args.objectID);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ success: true })
          }]
        };
      }

      case 'algolia:record:batch': {
        const result = await index.batch(args.operations);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ objectIDs: result.objectIDs })
          }]
        };
      }

      case 'algolia:settings:configure': {
        await index.setSettings(args.settings);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ success: true })
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
        uri: 'algolia://indices',
        name: 'Search Indices',
        description: 'List of all Algolia indices',
        mimeType: 'application/json'
      }
    ]
  };
});

server.setRequestHandler('resources/read', async (request) => {
  const { uri } = request.params;

  switch (uri) {
    case 'algolia://indices': {
      const result = await client.listIndices();
      return {
        contents: [{
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(result.items)
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
  console.error('Algolia MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
