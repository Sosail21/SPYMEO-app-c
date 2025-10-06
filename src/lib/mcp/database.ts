/**
 * Database Operations via MCP
 *
 * This module provides high-level database operations using the Prisma MCP server.
 * It wraps MCP tool calls in convenient TypeScript functions.
 */

import { getMCPManager } from './client';

const SERVER_NAME = 'prisma-local';

export interface MigrationOptions {
  name: string;
  createOnly?: boolean;
  skipSeed?: boolean;
}

export interface QueryOptions {
  model: string;
  operation: 'findMany' | 'findUnique' | 'create' | 'update' | 'delete' | 'upsert';
  data?: Record<string, any>;
}

/**
 * Prisma MCP Client
 *
 * Provides methods for database operations via Prisma MCP server
 */
export class PrismaMCPClient {
  /**
   * Read the current Prisma schema
   */
  async readSchema(): Promise<string> {
    const manager = await getMCPManager();
    const result = await manager.callTool(SERVER_NAME, 'prisma:schema:read', {});
    return result.schema || '';
  }

  /**
   * Validate Prisma schema
   */
  async validateSchema(): Promise<{ valid: boolean; errors?: string[] }> {
    const manager = await getMCPManager();
    const result = await manager.callTool(SERVER_NAME, 'prisma:schema:validate', {});
    return result;
  }

  /**
   * Generate Prisma Client
   */
  async generateClient(): Promise<void> {
    const manager = await getMCPManager();
    await manager.callTool(SERVER_NAME, 'prisma:model:generate', {});
  }

  /**
   * Create a new database migration
   */
  async createMigration(options: MigrationOptions): Promise<void> {
    const manager = await getMCPManager();
    await manager.callTool(SERVER_NAME, 'prisma:migration:create', {
      name: options.name,
      createOnly: options.createOnly || false
    });
  }

  /**
   * Apply pending migrations
   */
  async applyMigrations(skipSeed: boolean = false): Promise<void> {
    const manager = await getMCPManager();
    await manager.callTool(SERVER_NAME, 'prisma:migration:apply', {
      skipSeed
    });
  }

  /**
   * Get migration status
   */
  async getMigrationStatus(): Promise<any> {
    const manager = await getMCPManager();
    return await manager.callTool(SERVER_NAME, 'prisma:migration:status', {});
  }

  /**
   * Execute a Prisma query
   */
  async executeQuery<T = any>(options: QueryOptions): Promise<T> {
    const manager = await getMCPManager();
    return await manager.callTool<T>(SERVER_NAME, 'prisma:query:execute', {
      model: options.model,
      operation: options.operation,
      data: options.data
    });
  }

  /**
   * Seed the database
   */
  async seedDatabase(seedFile?: string): Promise<void> {
    const manager = await getMCPManager();
    await manager.callTool(SERVER_NAME, 'prisma:db:seed', {
      file: seedFile || './prisma/seed.ts'
    });
  }

  /**
   * Launch Prisma Studio
   */
  async launchStudio(port: number = 5555): Promise<void> {
    const manager = await getMCPManager();
    await manager.callTool(SERVER_NAME, 'prisma:studio:launch', { port });
  }

  /**
   * Get database schema as resource
   */
  async getSchemaResource(): Promise<string> {
    const manager = await getMCPManager();
    const contents = await manager.readResource(SERVER_NAME, 'prisma://schema');
    return contents;
  }

  /**
   * Get migration history
   */
  async getMigrationHistory(): Promise<any[]> {
    const manager = await getMCPManager();
    const contents = await manager.readResource(SERVER_NAME, 'prisma://migrations');
    return contents;
  }

  /**
   * Get all database models
   */
  async getModels(): Promise<any[]> {
    const manager = await getMCPManager();
    const contents = await manager.readResource(SERVER_NAME, 'prisma://models');
    return contents;
  }
}

/**
 * Singleton instance
 */
let prismaMCP: PrismaMCPClient | null = null;

export function getPrismaMCP(): PrismaMCPClient {
  if (!prismaMCP) {
    prismaMCP = new PrismaMCPClient();
  }
  return prismaMCP;
}

/**
 * Convenience functions for common operations
 */

/**
 * Create a migration and apply it
 */
export async function createAndApplyMigration(
  name: string,
  skipSeed: boolean = false
): Promise<void> {
  const prisma = getPrismaMCP();
  await prisma.createMigration({ name, createOnly: false });
  await prisma.applyMigrations(skipSeed);
  await prisma.generateClient();
}

/**
 * Validate schema and generate client
 */
export async function validateAndGenerate(): Promise<void> {
  const prisma = getPrismaMCP();
  const validation = await prisma.validateSchema();

  if (!validation.valid) {
    throw new Error(`Schema validation failed: ${validation.errors?.join(', ')}`);
  }

  await prisma.generateClient();
}

/**
 * Query builder helper
 */
export class PrismaQueryBuilder {
  private model: string;
  private operation: QueryOptions['operation'];
  private queryData: Record<string, any> = {};

  constructor(model: string) {
    this.model = model;
    this.operation = 'findMany';
  }

  findMany() {
    this.operation = 'findMany';
    return this;
  }

  findUnique() {
    this.operation = 'findUnique';
    return this;
  }

  create() {
    this.operation = 'create';
    return this;
  }

  update() {
    this.operation = 'update';
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  upsert() {
    this.operation = 'upsert';
    return this;
  }

  where(conditions: Record<string, any>) {
    this.queryData.where = conditions;
    return this;
  }

  data(data: Record<string, any>) {
    this.queryData.data = data;
    return this;
  }

  include(relations: Record<string, any>) {
    this.queryData.include = relations;
    return this;
  }

  select(fields: Record<string, any>) {
    this.queryData.select = fields;
    return this;
  }

  orderBy(order: Record<string, any>) {
    this.queryData.orderBy = order;
    return this;
  }

  take(count: number) {
    this.queryData.take = count;
    return this;
  }

  skip(count: number) {
    this.queryData.skip = count;
    return this;
  }

  async execute<T = any>(): Promise<T> {
    const prisma = getPrismaMCP();
    return await prisma.executeQuery<T>({
      model: this.model,
      operation: this.operation,
      data: this.queryData
    });
  }
}

/**
 * Create a query builder for a model
 */
export function query(model: string): PrismaQueryBuilder {
  return new PrismaQueryBuilder(model);
}

/**
 * Example usage:
 *
 * // Read schema
 * const schema = await getPrismaMCP().readSchema();
 *
 * // Create migration
 * await createAndApplyMigration('add_user_avatar');
 *
 * // Query using builder
 * const users = await query('User')
 *   .findMany()
 *   .where({ role: 'PRACTITIONER' })
 *   .include({ practitionerProfile: true })
 *   .orderBy({ createdAt: 'desc' })
 *   .take(10)
 *   .execute();
 *
 * // Create user
 * const newUser = await query('User')
 *   .create()
 *   .data({
 *     email: 'user@example.com',
 *     name: 'John Doe',
 *     role: 'USER'
 *   })
 *   .execute();
 */
