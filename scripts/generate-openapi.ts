import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { generateSpecs } from 'hono-openapi';

import app from '@/api';
import { openApiOptions } from '@/api/docs/openapi';

const outputPath = path.resolve(process.cwd(), process.env.OPENAPI_SPEC_PATH ?? '.openapi/openapi.json');

const spec = await generateSpecs(app, openApiOptions);

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(spec, null, 2)}\n`);

console.log(`Wrote OpenAPI spec to ${path.relative(process.cwd(), outputPath)}`);
