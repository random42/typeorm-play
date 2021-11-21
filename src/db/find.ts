import { SelectQueryBuilder } from 'typeorm';
import _ from 'lodash';
import { isAlpha } from 'validator';

const DEFAULT_OPS = {
  $and: 'AND',
  $not: 'NOT',
  $or: 'OR',
  $lt: '<',
  $lte: '<=',
  $gt: '>',
  $gte: '>=',
  $eq: '=',
  $notEq: '<>',
  $like: 'LIKE',
  $ilike: 'ILIKE',
  $in: 'IN',
  $notIn: 'NOT IN',
  $isNull: 'IS NULL',
  $isNotNull: 'IS NOT NULL',
  $between: 'BETWEEN',
};

// used to join relations in the right order
const getDepth = (path: string) => path.split('.').length;

// path = variants.next.id => variants.next
// path = id => undefined
const getParent = (path: string): string | undefined => {
  const i = path.lastIndexOf('.');
  return i >= 0 ? path.substring(0, i) : undefined;
};

// path = variants.next.id => id
// path = id => id
const getLast = (path: string) => {
  const i = path.lastIndexOf('.');
  return i >= 0 ? path.substring(i + 1, path.length) : path;
};

const isDotPath = (s: string): boolean =>
  s.split('.').every((x) => {
    if (x.length === 0) return false;
    let i;
    for (i = 0; i < x.length && isAlpha(x.charAt(i)); i++);
    return i === x.length;
  });

const isParam = (s: string): boolean => {
  return !!(
    s && s.charAt(0) === ':' && Array.from(s.slice(1)).every((c) => isAlpha(c))
  );
};

const isOperation = (s: string): boolean => {
  return !!(
    s && s.charAt(0) === '$' && Array.from(s.slice(1)).every((c) => isAlpha(c))
  );
};

// sets missing relations
// {
//   'variants.next': false,
//   'next.variants.tags': true
// }
// ==>
// {
//   'variants': false,
//   'variants.next': false,
//   'next': true,
//   'next.variants': true,
//   'next.variants.tags': true,
//   'next.tags': true
// }
const fixRelations = (obj) => {
  const x = _.clone(obj);
  Object.keys(obj).forEach((r) => {
    let parent = getParent(r);
    while (parent) {
      // order is important
      x[parent] = obj[r] || obj[parent] || false;
      parent = getParent(parent);
    }
  });
  return x;
};

type Where = Array<any>;

export interface Query {
  where?: Where;
  params?: { [p: string]: any };
  relations?: string[];
  sort?: { [r: string]: 'DESC' | 'ASC' };
  offset?: number;
  limit?: number;
  page?: number;
  cache?: any;
}

export class QueryBuilder<Entity> {
  // maps dot path relation to true if relation is selected, false if relation is only used in query
  private relations: { [r: string]: boolean } = {};
  private nextAlias = 0;
  // maps dot path relation to an integer string in order to avoid aliases longer than 63 characters (Postgres limitation)
  private aliases: { [r: string]: string } = {};

  constructor(
    private qb: SelectQueryBuilder<Entity>,
    private entity: string,
    private query: Query,
    private operations: { [op: string]: string } = DEFAULT_OPS,
  ) {
    this.aliases = {};
  }

  build() {
    // parse `where` and `sort` before joining in order to
    // know relations that are not selected but
    // used in `where` conditions
    const { query } = this;
    const sql = this.buildQuery(query.where);
    this.joinRelations();
    sql && this.qb.where(sql);
    this.setParameters(); // parameters gathered during 'where' parsing
    this.sort();
    this.paginate();
    this.cache();
    return this.qb;
  }

  // alias for a given dot path relation, create it if it doesn't exist
  private getAlias(path: string) {
    if (!path) return this.entity;
    if (!this.aliases[path]) {
      this.relations[path] = this.relations[path] || false;
      this.aliases[path] = this.nextAlias.toString();
      this.nextAlias++;
    }
    return this.aliases[path];
  }

  private getAliasedAttribute(path: string) {
    return `${this.getAlias(getParent(path))}.${getLast(path)}`;
  }

  private buildQuery(token: any): string {
    if (Array.isArray(token)) {
      return `(${token.map((x) => this.buildQuery(x)).join(' ')})`;
    }
    if (typeof token === 'string') {
      if (isOperation(token)) {
        const op = this.operations[token];
        if (!op) {
          throw new Error(`Invalid operation "${token}"`);
        } else return op;
      } else if (isDotPath(token)) {
        // friends.profile
        return `${this.getAliasedAttribute(token)}`;
      } else if (isParam(token)) {
        return token;
      } else {
        throw new Error(`Invalid 'where' string "${token}"`);
      }
    }
  }

  private joinRelations() {
    const selected = this.query.relations || [];
    selected.forEach((r) => {
      this.relations[r] = true;
    });
    this.relations = fixRelations(this.relations);
    const sorted = Object.keys(this.relations).sort(
      (a, b) => getDepth(a) - getDepth(b),
    );
    sorted.forEach((r) => {
      if (!isDotPath(r)) {
        throw new Error(`'${r}' is not a valid dot path`);
      }
      const attr = this.getAliasedAttribute(r);
      const alias = this.getAlias(r);
      if (this.relations[r]) {
        this.qb.leftJoinAndSelect(attr, alias);
      } else {
        this.qb.leftJoin(attr, alias);
      }
    });
  }

  private setParameters() {
    this.qb.setParameters(this.query.params);
  }

  private sort() {
    const { sort } = this.query;
    if (sort) {
      const s = {};
      Object.keys(sort).forEach((path) => {
        s[this.getAliasedAttribute(path)] = sort[path];
      });
      this.qb.orderBy(s);
    }
  }

  private paginate() {
    const { page, limit } = this.query;
    let { offset = 0 } = this.query;
    if (page && !limit) {
      throw new Error('Cannot paginate with not "limit"');
    }
    offset = page ? (page - 1) * limit : offset;
    if (offset) {
      this.qb.skip(offset);
    }
    if (limit) {
      this.qb.take(limit);
    }
  }

  private cache() {
    const { cache } = this.query;
    if (cache) {
      this.qb.cache(cache);
    }
  }
}

export const buildQuery = <Entity>(
  qb: SelectQueryBuilder<Entity>,
  entity: string,
  query: Query,
) => {
  return new QueryBuilder(qb, entity, query).build();
};
