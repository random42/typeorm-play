import assert from 'assert';
import {
  createConnection,
  EntityManager,
  Connection,
  ConnectionOptions,
  SelectQueryBuilder,
} from 'typeorm';
import { buildQuery, Query } from './find';

export class DB {
  constructor(private conn?: Connection, private manager?: EntityManager) {}

  async connect(options?: ConnectionOptions) {
    this.conn = await createConnection(options);
    this.manager = this.conn.manager;
  }

  async find<Entity>(
    entity: { new (): Entity },
    query: Query,
  ): Promise<Entity[]> {
    const qb: SelectQueryBuilder<Entity> = this.manager.createQueryBuilder();
    buildQuery(qb, entity.name, query);
    return qb.getMany();
  }
}
