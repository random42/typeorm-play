import 'reflect-metadata';
require('dotenv').config();
import { EntityManager } from '../db';
import {
  createConnection,
  getConnectionOptions,
  Transaction,
  TransactionManager,
  EntityManager as EM,
  getManager,
  Entity,
} from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
const debug = require('debug')('main');

import { User, Author, Book } from '../entity';

const sleep = (ms) => new Promise((s) => setTimeout(s, ms));

const log = console.error;
const out = console.log;
const prettyJson = (x) => JSON.stringify(x, null, 2);
const outPrettyJson = (x) => out(prettyJson(x));

const { env } = process;

const AUTHORS = require('../../data/authors.json');

class Test {
  @Transaction()
  async ts(@TransactionManager() m: EntityManager) {
    console.error(m instanceof EntityManager);
    console.error(m instanceof EM);
    return m.find(Book);
  }
}



async function main() {
  const opt = await getConnectionOptions();
  const c = await createConnection({
    ...opt,
    // dropSchema: true,
    namingStrategy: new SnakeNamingStrategy(),
  });
  const db: EntityManager = Object.create(EntityManager.prototype, Object.getOwnPropertyDescriptors(c.manager));
  // await db.save(Author, AUTHORS);
  const x = new Test();
  const data = await db.transaction(m => m.find(Book));
  // const data = await x.ts(db);
  log('data', data.length)
  // outPrettyJson(data);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    out(err);
    process.exit(0);
  });
