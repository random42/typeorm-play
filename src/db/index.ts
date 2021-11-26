import {
  EntityManager as EM,
  SelectQueryBuilder,
} from 'typeorm';
import { IsolationLevel } from "typeorm/driver/types/IsolationLevel";
import { EntityTarget } from "typeorm/common/EntityTarget";
import { find, Query } from './find';

export class EntityManager extends EM {

  transaction<T>(runInTransaction: (m: EntityManager) => Promise<T>): Promise<T>;
  transaction<T>(isolationLevel: IsolationLevel, runInTransaction: (m: EntityManager) => Promise<T>): Promise<T>;


  transaction<T>(x, y?) {
    const func: (manager: EntityManager) => Promise<T> = y || x;
    const isolationLevel: IsolationLevel = y && x;
    const run = function(manager: EM) {
      const clone: EntityManager = Object.create(EntityManager.prototype, Object.getOwnPropertyDescriptors(manager));
      return func(clone);
    };
    if (!isolationLevel) {
      return super.transaction(run);
    } else {
      return super.transaction(isolationLevel, run);
    }
  }

  selectQuery<Entity>(
    entityClass: EntityTarget<Entity>,
    query: Query,
  ): SelectQueryBuilder<Entity> {
    const metadata = this.connection.getMetadata(entityClass);
    let qb: SelectQueryBuilder<Entity> = this.createQueryBuilder(
      entityClass,
      metadata.name,
    );
    qb = find(qb, query);
    return qb;
  }
}
