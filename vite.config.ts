import { execFileSync } from 'node:child_process';
import type { Plugin } from 'vite';
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

/**
 * Puts the identifier in the served HTML as well as in the bundle.
 *
 * SF-8 says a deployment is verified by fetching the artefact, never by asking the host's control
 * API. An identifier that exists only inside the JavaScript needs a browser to read, which makes
 * that check heavier than it should be — a meta tag makes it one request and one grep.
 */
function stampIdentifierIntoHtml(identifier: string): Plugin {
  return {
    name: 'trazer:build-identifier',
    transformIndexHtml: () => [
      { tag: 'meta', attrs: { name: 'build-identifier', content: identifier }, injectTo: 'head' },
    ],
  };
}

/**
 * `/dev` alone 404s: Vite's dev server resolves a directory request by its trailing slash, and
 * `/dev/style.html`'s own links already write the slash. This is the one place typing it by hand
 * still happens, so the shortest fix is a redirect rather than asking every dev page to spell out
 * `/dev/index.html`.
 *
 * **Dev-server only.** `configureServer` never runs for `vite build` or `vite preview`, and `dev/`
 * is not in the built output regardless — so this reaches nothing the deployed page serves.
 */
function redirectBareDevRoute(): Plugin {
  return {
    name: 'trazer:dev-index-route',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/dev') {
          res.statusCode = 302;
          res.setHeader('Location', '/dev/');
          res.end();
          return;
        }
        next();
      });
    },
  };
}

// Asked once, so the meta tag and the bundle can never disagree about what was built.
const identifier = buildIdentifier();

export default defineConfig({
  base: './',
  plugins: [stampIdentifierIntoHtml(identifier), redirectBareDevRoute()],
  define: {
    __BUILD_IDENTIFIER__: JSON.stringify(identifier),
  },
  test: {
    // The application and the dev pages. e2e/ is Playwright's, and vitest's default glob would
    // otherwise claim it. `dev/` is here because a dev page's level building is plain state like
    // any other — the page is excluded from the build, not from the suite.
    include: ['{src,dev}/**/*.test.ts'],
  },
});
