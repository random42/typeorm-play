import "reflect-metadata";
import { createConnection, getConnectionOptions, FileLogger, getManager } from 'typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
require('dotenv').config()

import { User, Author } from '../entity'


const sleep = ms => new Promise((s) => setTimeout(s, ms));

const log = console.error;
const out = console.log;
const prettyJson = x => JSON.stringify(x, null, 2);
const outPrettyJson = x => out(prettyJson(x));


const { env } = process;

const AUTHORS = require('../../data/authors.json')

async function main() {
  const opt = await getConnectionOptions();
  const c = await createConnection({
    ...opt,
    namingStrategy: new SnakeNamingStrategy(),
  });
  const { manager: m } = c;
  await m.save(Author, AUTHORS);
  let data;
  data = await m.find(Author, {
    relations: ['books', 'books.chapters']
  });
  outPrettyJson(data)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    out(err)
    process.exit(0)
  })
