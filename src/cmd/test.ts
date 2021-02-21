import "reflect-metadata";
import { createConnection, FileLogger, getManager } from 'typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
require('dotenv').config()

import * as model from '../model'

const { User, Author } = model;

const sleep = ms => new Promise((s) => setTimeout(s, ms));

const log = console.error;
const out = console.log;
const prettyJson = x => JSON.stringify(x, null, 2);
const outPrettyJson = x => out(prettyJson(x));


const { TYPEORM_URL, TYPEORM_ENTITIES } = process.env;

const AUTHORS = require('../../data/sample/author.json')

async function run() {
  const c = await createConnection({
    type: 'postgres',
    url: TYPEORM_URL,
    entities: Object.values(model),
    logging: true,
    namingStrategy: new SnakeNamingStrategy(),
    dropSchema: true,
    synchronize: true,
  });
  // out(c)
  const m = getManager()
  await m.save(Author, AUTHORS);
  let data;
  data = await m.find(Author, {
    relations: ['books', 'books.chapters']
  });
  outPrettyJson(data)
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    out(err)
    process.exit(0)
  })
