import "reflect-metadata";
import { createConnection, FileLogger, getManager } from 'typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import * as model from '../model'

const { User } = model;

const sleep = ms => new Promise((s) => setTimeout(s, ms));

const log = console.error;
const out = console.log;

const { TYPEORM_URL, TYPEORM_ENTITIES } = process.env;

async function run() {
  const c = await createConnection({
    type: 'postgres',
    url: TYPEORM_URL,
    entities: Object.values(model),
    namingStrategy: new SnakeNamingStrategy(),
    synchronize: true
  });
  // out(c)
  const m = getManager()
  const d = await m.find(User);
  log(d)
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    out(err)
    process.exit(0)
  })
