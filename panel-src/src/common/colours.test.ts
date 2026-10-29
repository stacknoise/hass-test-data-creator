import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const LITERAL_COLOUR = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/;

/** Return the source files below `dir` that are not tests. */
function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sources(path);
    return path.endsWith('.ts') && !path.endsWith('.test.ts') ? [path] : [];
  });
}

describe('colours', () => {
  it('come only from Home Assistant CSS variables, never as literals', () => {
    const offenders = sources(join(__dirname, '..')).filter((path) =>
      LITERAL_COLOUR.test(readFileSync(path, 'utf8')),
    );
    expect(offenders).toEqual([]);
  });
});
