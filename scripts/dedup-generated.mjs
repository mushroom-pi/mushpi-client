import { readFileSync, writeFileSync } from 'fs';

const filePath = 'src/api/generated/api.ts';
let content = readFileSync(filePath, 'utf8');

// Match all export const ... = { ... } as const; blocks and their type aliases
const constRegex = /export const (\w+) = \{[\s\S]*?\} as const;\s*export type \1 = [^;]+;/g;

const seen = new Set();
content = content.replace(constRegex, (match, name) => {
  if (seen.has(name)) {
    return `// [deduped] ${name}`;
  }
  seen.add(name);
  return match;
});

writeFileSync(filePath, content, 'utf8');
console.log('✅ Deduplicated generated api.ts');
