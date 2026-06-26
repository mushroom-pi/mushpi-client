/**
 * Post-processing fixes for openapi-zod-client bugs (v1.18.3).
 *
 * Fix 1: Bare Array types
 * When generating TypeScript types for array properties, the library sometimes
 * produces bare `Array` without a type parameter, causing TS error:
 * Generic type 'Array<T>' requires 1 type argument(s).ts(2314)
 *
 * This script cross-references the Zod schemas (which are correct) to determine
 * the proper type parameter for each bare Array, making the fix fully automatic
 * for any new array properties added to the backend.
 *
 * Fix 2: Missing type annotations for z.lazy()
 * When using the schemas-only template, circular references use z.lazy() without
 * type annotations. TypeScript can't infer the return type when there are circular
 * references, causing TS error:
 * Function implicitly has return type 'any'.ts(7024)
 *
 * The upstream repo (astahurski/openapi-zod-client) is not processing PRs, so this
 * post-processing script is the pragmatic fix. It runs automatically after gen:schemas.
 */
import { readFileSync, writeFileSync } from 'fs';

const filePath = 'src/api/generated/schemas.ts';
let content = readFileSync(filePath, 'utf8');
let changed = false;

// Fix 1: Bare Array types
// Build a map from property names to their array element types using the Zod schemas
// Matches: propName: z.array(Readings)  →  Readings
//          propName: z.array(z.string() →  string
const zodArrayPattern = /(\w+)\s*:\s*z\.array\(\s*(?:z\.((?!instanceof\b)\w+)\(|(\w+))/g;
const arrayTypeMap = new Map();
let match;
while ((match = zodArrayPattern.exec(content)) !== null) {
  const [, propName, zodPrimitive, namedType] = match;
  arrayTypeMap.set(propName, zodPrimitive || namedType);
}

// Replace all bare Array occurrences in type definitions
content = content.replace(
  /(\b(\w+)\??\s*:\s*)(\(?)Array(?!\s*<)(\s*(?:\|\s*null\))?\s*(?:\|\s*undefined)?)/g,
  (fullMatch, prefix, propName, openParen, suffix) => {
    const tsType = arrayTypeMap.get(propName);
    if (tsType) {
      changed = true;
      return `${prefix}${openParen}Array<${tsType}>${suffix}`;
    }
    return fullMatch;
  },
);

// Fix 2: Add type annotations to z.lazy() calls for circular references
const lazyPattern = /^const (\w+) = z\.lazy\(\(\) =>/gm;
content = content.replace(lazyPattern, (_match, schemaName) => {
  changed = true;
  return `const ${schemaName}: z.ZodType<${schemaName}> = z.lazy(() =>`;
});

if (changed) {
  writeFileSync(filePath, content, 'utf8');
  console.log('✅ Fixed generated schemas.ts (Array types and z.lazy annotations)');
} else {
  console.log('ℹ️  No fixes needed in schemas.ts');
}
