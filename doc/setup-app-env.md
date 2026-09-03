# Application environment

**Owns.** How this actually runs on a real machine, and how to tell whether it is running.

**Not here.** Which technologies — [spec-tech.md](spec-tech.md) · the machine the work is *done* on,
as against the machine the application *runs* on — [setup-dev-env.md](setup-dev-env.md) · how an AI
agent drives this machine — [setup-ai-env.md](setup-ai-env.md).

**Written to the same contract** — silent failures first, and no personal details in a committed
file. Stated once in [setup-ai-env.md](setup-ai-env.md) and deliberately not restated here.

---

## Machine:GITHUB-PAGES — there is no machine

Nothing of ours runs. The application is static files served from GitHub's CDN, and everything
happens in the visitor's browser. There is no process to start, no port to open, no service to
restart and no log to read on anything we control.

That is not a gap in this document. It is the consequence of the architecture in
[spec-tech.md](spec-tech.md), and most of the reason that architecture was chosen.

### Deploying

**Push to `main`.** `.github/workflows/deploy.yml` type-checks, runs the domain tests, runs the
smoke tests, builds, publishes and then verifies. There is no manual step, and adding one would
reintroduce **SF-11** — a build from a dirty tree stamps a commit that does not describe it, and a
CI checkout is the only clean tree anybody can promise.

**Every branch runs everything except the publish.** Otherwise the first CI run of a change is the
one that happens after it is merged, which makes `main` the place CI failures are discovered.

### Verifying that it actually deployed

```bash
bash scripts/verify-deployment.sh <the pages url> "$(git rev-parse origin/main)"
```

The workflow runs this itself, and it is worth running by hand whenever something looks wrong.

**It fetches the page and reads the `build-identifier` meta tag** — never asking GitHub whether the
deployment succeeded. **SF-8**: a control API reports *not enabled* and *not allowed to ask*
identically, so it answers neither question. The artefact is the only thing that can only be right
when the thing actually works.

It separates three failures that a control API would report as one:

| What it says | What happened |
|---|---|
| no meta tag at all | not our page — a 404 page, or a stale deployment from before the tag existed |
| `unknown` | built outside a repository (**SF-7**) — the build exited 0 and nothing else noticed |
| a real but different commit | **the deployment did not fail; it served an older build** |

The third is the one worth having. Nothing else in the pipeline notices it.

### The default branch is the host's opinion, not ours

**SF-9**: pushing a branch does not make it the remote's default, and nothing local can detect the
disagreement. The workflow triggers on `main`, so if the host's default were something else, clones
and any branch-triggered automation would quietly work against the other one. **Read it back from
the host** rather than inferring it from a push that succeeded.

## What only a person can do

Both are web-UI actions, and an agent that meets them appears to stall rather than to fail:

- **Making the repository public.** GitHub Pages needs a paid plan to serve a private repository.
- **Enabling Pages with its source set to GitHub Actions** — Settings → Pages. Until that is set,
  `actions/deploy-pages` fails, and it fails in a way that reads like a permissions problem.
