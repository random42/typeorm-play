import 'reflect-metadata';
require('dotenv').config();
import {
  createConnection,
  getConnectionOptions,
  Transaction,
  TransactionManager,
  EntityManager,
  getManager,
  Entity,
} from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import select from 'typeorm-select';
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
  const db = getManager();
  // await db.save(Author, AUTHORS);
  const x = new Test();
  const data = await select(Author, {
    where: ['books.name', '$ilike', ':x'],
    params: {
      x: '%',
    },
    sort: {
      'books.id': 'DESC'
    },
    relations: ['books.chapters'],
    // limit: 2,
  }, db).getMany();
  // log('data', data)
  outPrettyJson(data);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    out(err);
    process.exit(0);
  });
