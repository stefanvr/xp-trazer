import { execFileSync } from 'node:child_process';
import { defineConfig } from 'vitest/config';

/**
 * The identifier the built page reports. SF-7 in doc/setup-ai-env.md: a build outside a repository
 * degrades to `unknown` and still exits zero, so the smoke test asserts this is *not* `unknown`
 * rather than merely present. SF-11: a build from a dirty tree stamps a commit that does not
 * describe what was compiled, so say so rather than stamping a comfortable half-truth.
 */
function buildIdentifier(): string {
  try {
    const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    const dirty = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim() !== '';
    return dirty ? `${head}-dirty` : head;
  } catch {
    return 'unknown';
  }
}

export default defineConfig({
  base: './',
  define: {
    __BUILD_IDENTIFIER__: JSON.stringify(buildIdentifier()),
  },
  test: {
    // Domain tests only. e2e/ is Playwright's, and vitest's default glob would otherwise claim it.
    include: ['src/**/*.test.ts'],
  },
});
