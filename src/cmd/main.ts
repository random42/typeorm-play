import 'reflect-metadata';
require('dotenv').config();
import { DB } from '../db';
import {
  createConnection,
  getConnectionOptions,
  FileLogger,
  getManager,
} from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
const debug = require('debug')('main');

import { User, Author } from '../entity';

const sleep = (ms) => new Promise((s) => setTimeout(s, ms));

const log = console.error;
const out = console.log;
const prettyJson = (x) => JSON.stringify(x, null, 2);
const outPrettyJson = (x) => out(prettyJson(x));

const { env } = process;

const AUTHORS = require('../../data/authors.json');

async function main() {
  const opt = await getConnectionOptions();
  const c = await createConnection({
    ...opt,
    dropSchema: true,
    namingStrategy: new SnakeNamingStrategy(),
  });
  const db = new DB(c);
  await db.save(Author, AUTHORS);
  const data = await db.find(Author, {
    where: [
      ['birthday', '$between', ':from', '$and', ':to'],
      '$or',
      ['books.chapters.name', '$ilike', ':n']
    ],
    params: {
      from: '1990-01-01',
      to: '1991-01-01',
      n: '%eh%',
    },
    relations: ['books'],
  });
  outPrettyJson(data);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    out(err);
    process.exit(0);
  });
