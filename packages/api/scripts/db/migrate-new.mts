#!/usr/bin/env tsx

import fs from 'node:fs';
import path from 'node:path';

const slug = (process.argv[2] || 'migration').replace(/[^a-z0-9_-]/gi, '_');
const tz = new Date().toISOString().replace(/[:]/g, '-').replace(/\..+/, '');
const dir = path.resolve('migrations');
const file = path.join(dir, `${tz}_${slug}.sql`);

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const header = `-- ${tz} ${slug}
-- One DDL per statement (DSQL).
-- No transactions, no PL/pgSQL, no sequences.
`;

fs.writeFileSync(file, header, { flag: 'wx' });
console.log(file);
