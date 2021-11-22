import assert from 'assert';
import {
  createConnection,
  EntityManager,
  Connection,
  ConnectionOptions,
  SelectQueryBuilder,
} from 'typeorm';
import { find, Query } from './find';

export class DB {
  private manager: EntityManager;

  constructor(private conn: Connection, manager?: EntityManager) {
    this.manager = manager || conn.manager;
  }

  // async connect(options?: ConnectionOptions) {
  //   this.conn = await createConnection(options);
  //   this.manager = this.conn.manager;
  // }

  async transaction(f: (db: DB) => Promise<any>) {
    return this.manager.transaction((m) => f(new DB(m.connection, m)));
  }

  async find<Entity>(
    entity: { new (): Entity },
    query: Query,
  ): Promise<Entity[]> {
    let qb: SelectQueryBuilder<Entity> = this.conn.createQueryBuilder(
      entity,
      entity.name,
    );
    qb = find(qb, query);
    return qb.getMany();
  }

  // save = EntityManager.prototype.save;

  save = (
    ...args: Parameters<EntityManager['save']>
  ): ReturnType<EntityManager['save']> => {
    return this.manager.save(...args);
  };
}
