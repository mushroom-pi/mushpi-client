/**
 * Post-processing fix for openapi-zod-client bug (v1.18.3).
 *
 * When generating TypeScript types for properties like `readings?: Array<Readings>`,
 * the library calls getTypescriptFromOpenApi() recursively for the array item schema.
 * If that item resolves to a named object (via $ref), the result is a TypeAliasDeclaration
 * node rather than a type reference. tanu.t.array() can't use a declaration as a generic
 * type argument, so the printed output loses the <Readings> part, producing bare `Array`.
 *
 * This causes TS error: Generic type 'Array<T>' requires 1 type argument(s).ts(2314)
 *
 * The upstream repo (astahurski/openapi-zod-client) is not accepting PRs, so this
 * post-processing script is the pragmatic fix. It runs automatically after gen:schemas.
 */
import { readFileSync, writeFileSync } from 'fs';

const filePath = 'src/api/generated/schemas.ts';
let content = readFileSync(filePath, 'utf8');

const fixes = [
  { pattern: /(\breadings\?\s*:\s*)Array(\s*\|\s*undefined)/g, replacement: '$1Array<Readings>$2' },
  { pattern: /(\bbatches\?\s*:\s*)Array(\s*\|\s*undefined)/g, replacement: '$1Array<Batch>$2' },
  { pattern: /(\bimages\?\s*:\s*\(?)Array(\s*\|\s*null\)?\s*\|\s*undefined)/g, replacement: '$1Array<string>$2' },
  { pattern: /(\bimages_url\?\s*:\s*)Array(\s*\|\s*undefined)/g, replacement: '$1Array<string>$2' },
];

let changed = false;
for (const { pattern, replacement } of fixes) {
  const next = content.replace(pattern, replacement);
  if (next !== content) changed = true;
  content = next;
}

if (changed) {
  writeFileSync(filePath, content, 'utf8');
  console.log('✅ Fixed bare Array types in generated schemas.ts');
} else {
  console.log('ℹ️  No bare Array types found in schemas.ts');
}
