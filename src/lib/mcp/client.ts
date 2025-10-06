/**
 * MCP Client Wrapper
 *
 * This module provides a unified interface for interacting with MCP servers
 * from the SPYMEO application code. It handles connection management,
 * error handling, and provides TypeScript type safety.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

export interface MCPServerConfig {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  enabled?: boolean;
}

export interface MCPToolCall {
  name: string;
  parameters: Record<string, any>;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

/**
 * MCP Client Manager
 *
 * Manages connections to multiple MCP servers and provides
 * a unified interface for tool execution and resource access.
 */
export class MCPClientManager {
  private clients: Map<string, Client> = new Map();
  private transports: Map<string, StdioClientTransport> = new Map();
  private configs: Map<string, MCPServerConfig> = new Map();

  constructor(configs: MCPServerConfig[]) {
    configs.forEach(config => {
      if (config.enabled !== false) {
        this.configs.set(config.name, config);
      }
    });
  }

  /**
   * Connect to an MCP server
   */
  async connect(serverName: string): Promise<void> {
    const config = this.configs.get(serverName);
    if (!config) {
      throw new Error(`MCP server '${serverName}' not configured`);
    }

    if (this.clients.has(serverName)) {
      // Already connected
      return;
    }

    try {
      // Spawn the MCP server process
      const serverProcess = spawn(config.command, config.args, {
        env: {
          ...process.env,
          ...config.env
        },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // Create transport
      const transport = new StdioClientTransport({
        command: config.command,
        args: config.args,
        env: config.env
      });

      this.transports.set(serverName, transport);

      // Create client
      const client = new Client({
        name: 'spymeo-client',
        version: '1.0.0'
      });

      // Connect client to transport
      await client.connect(transport);

      this.clients.set(serverName, client);

      console.log(`Connected to MCP server: ${serverName}`);
    } catch (error) {
      console.error(`Failed to connect to MCP server '${serverName}':`, error);
      throw error;
    }
  }

  /**
   * Disconnect from an MCP server
   */
  async disconnect(serverName: string): Promise<void> {
    const client = this.clients.get(serverName);
    const transport = this.transports.get(serverName);

    if (transport) {
      await transport.close();
      this.transports.delete(serverName);
    }

    if (client) {
      await client.close();
      this.clients.delete(serverName);
    }

    console.log(`Disconnected from MCP server: ${serverName}`);
  }

  /**
   * Disconnect from all MCP servers
   */
  async disconnectAll(): Promise<void> {
    const serverNames = Array.from(this.clients.keys());
    await Promise.all(serverNames.map(name => this.disconnect(name)));
  }

  /**
   * Get connected client
   */
  getClient(serverName: string): Client {
    const client = this.clients.get(serverName);
    if (!client) {
      throw new Error(`MCP server '${serverName}' not connected. Call connect() first.`);
    }
    return client;
  }

  /**
   * Check if server is connected
   */
  isConnected(serverName: string): boolean {
    return this.clients.has(serverName);
  }

  /**
   * Call an MCP tool
   */
  async callTool<T = any>(
    serverName: string,
    toolName: string,
    parameters: Record<string, any> = {}
  ): Promise<T> {
    if (!this.isConnected(serverName)) {
      await this.connect(serverName);
    }

    const client = this.getClient(serverName);

    try {
      const result = await client.callTool({
        name: toolName,
        arguments: parameters
      });

      return result.content as T;
    } catch (error) {
      console.error(`MCP tool call failed: ${serverName}.${toolName}`, error);
      throw error;
    }
  }

  /**
   * Get available tools from a server
   */
  async listTools(serverName: string): Promise<any[]> {
    if (!this.isConnected(serverName)) {
      await this.connect(serverName);
    }

    const client = this.getClient(serverName);

    try {
      const response = await client.request(
        { method: 'tools/list' },
        { schema: 'tools/list' }
      );

      return response.tools || [];
    } catch (error) {
      console.error(`Failed to list tools for ${serverName}:`, error);
      throw error;
    }
  }

  /**
   * Read a resource from an MCP server
   */
  async readResource(serverName: string, uri: string): Promise<any> {
    if (!this.isConnected(serverName)) {
      await this.connect(serverName);
    }

    const client = this.getClient(serverName);

    try {
      const response = await client.request(
        {
          method: 'resources/read',
          params: { uri }
        },
        { schema: 'resources/read' }
      );

      return response.contents;
    } catch (error) {
      console.error(`Failed to read resource ${uri} from ${serverName}:`, error);
      throw error;
    }
  }

  /**
   * List available resources from a server
   */
  async listResources(serverName: string): Promise<MCPResource[]> {
    if (!this.isConnected(serverName)) {
      await this.connect(serverName);
    }

    const client = this.getClient(serverName);

    try {
      const response = await client.request(
        { method: 'resources/list' },
        { schema: 'resources/list' }
      );

      return response.resources || [];
    } catch (error) {
      console.error(`Failed to list resources for ${serverName}:`, error);
      throw error;
    }
  }

  /**
   * Get available prompts from a server
   */
  async listPrompts(serverName: string): Promise<any[]> {
    if (!this.isConnected(serverName)) {
      await this.connect(serverName);
    }

    const client = this.getClient(serverName);

    try {
      const response = await client.request(
        { method: 'prompts/list' },
        { schema: 'prompts/list' }
      );

      return response.prompts || [];
    } catch (error) {
      console.error(`Failed to list prompts for ${serverName}:`, error);
      throw error;
    }
  }

  /**
   * Execute a prompt
   */
  async executePrompt(
    serverName: string,
    promptName: string,
    arguments_: Record<string, string> = {}
  ): Promise<any> {
    if (!this.isConnected(serverName)) {
      await this.connect(serverName);
    }

    const client = this.getClient(serverName);

    try {
      const response = await client.request(
        {
          method: 'prompts/get',
          params: {
            name: promptName,
            arguments: arguments_
          }
        },
        { schema: 'prompts/get' }
      );

      return response;
    } catch (error) {
      console.error(`Failed to execute prompt ${promptName} on ${serverName}:`, error);
      throw error;
    }
  }
}

/**
 * Load MCP configuration from config file
 */
export async function loadMCPConfig(): Promise<MCPServerConfig[]> {
  try {
    const configPath = process.env.MCP_CONFIG_PATH || '.mcp/config.json';
    const config = await import(`@/../${configPath}`);

    const servers: MCPServerConfig[] = [];

    for (const [name, serverConfig] of Object.entries(config.mcpServers || {})) {
      const server = serverConfig as any;
      servers.push({
        name,
        command: server.command,
        args: server.args || [],
        env: server.env || {},
        enabled: server.enabled !== false
      });
    }

    return servers;
  } catch (error) {
    console.error('Failed to load MCP configuration:', error);
    return [];
  }
}

/**
 * Create and initialize MCP client manager
 */
export async function createMCPManager(): Promise<MCPClientManager> {
  const configs = await loadMCPConfig();
  return new MCPClientManager(configs);
}

/**
 * Singleton instance for application-wide use
 */
let mcpManager: MCPClientManager | null = null;

export async function getMCPManager(): Promise<MCPClientManager> {
  if (!mcpManager) {
    mcpManager = await createMCPManager();
  }
  return mcpManager;
}

/**
 * Cleanup MCP connections on process exit
 */
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    if (mcpManager) {
      await mcpManager.disconnectAll();
    }
  });
}
