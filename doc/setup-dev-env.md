# Development environment

**Owns.** Bringing a machine from nothing to able to develop this project: what to install, what to
configure, and in what order.

**Not here.** Which technologies — [spec-tech.md](spec-tech.md). How an AI agent drives a machine
that is *already* working, and which of its commands succeed while doing the wrong thing —
[setup-ai-env.md](setup-ai-env.md). How the application runs on a machine that is not this one —
that is [setup-app-env.md](setup-app-env.md).

**The boundary with [setup-ai-env.md](setup-ai-env.md), because it is easy to get wrong.** That
document assumes the machine works and asks *what lies to you*. This one assumes nothing is installed
and asks *what to run*. A check that catches a mistake belongs there; a step that prevents one
belongs here.

**Written to the same contract** — silent failures first, and no personal details in a committed
file. That contract is stated once, in [setup-ai-env.md](setup-ai-env.md), and deliberately not
restated here: a rule copied into a second place is a rule that will eventually disagree with itself.

**Verified and unverified steps are marked, and the difference matters.** ✅ means it was run on this
machine and did what it says. Steps for a machine this one is not — no `nvm`, no Node, a barer
distro — cannot be verified without breaking the machine that works, so they carry no mark. Reporting
them as verified would be exactly the kind of confident wrong answer this document set exists to
prevent.

---

## What the project needs

| Thing | Version | Where that is decided |
|---|---|---|
| Node | 24 | [spec-tech.md](spec-tech.md) pins it; `.nvmrc` carries it |
| npm | whatever ships with Node | — |
| git | any recent | SSH to the remote, never HTTPS — **SF-3** |
| A chromium binary for Playwright | whatever Playwright pins | installed by Playwright, not by the distro |

## From a clone

```bash
git clone <the ssh remote> && cd trazer
nvm use        # reads .nvmrc
npm ci
npm test
```

✅ `nvm use` selects 24 from `.nvmrc`. ✅ `npm ci` into a deliberately wiped `node_modules`, followed
by `npm test`, gives 12 passing domain tests.

**`npm ci`, not `npm install`**, and **read the output rather than only the exit code**. Why each
matters, and what a successful install can hide, is in [lessons/node.md](lessons/node.md).

## When nvm is not there

`nvm` is how *this* machine has a chosen Node version, and it is not the only way. Three routes, and
they are not equivalent:

- **Install nvm**, then `nvm install 24`. Matches this machine, and makes `.nvmrc` meaningful.
- **A version manager that is not nvm** — `fnm`, `asdf`, `mise`. `.nvmrc` is widely understood by
  these, so it usually keeps working.
- **A system Node**, from the distro or from the vendor's repository. Simplest, and it removes
  **SF-1** entirely — with only one Node installed, no shell flag can select the wrong one. What it
  removes with it is the ability to hold a version: you get whatever that source ships, and the
  distro's is often several majors behind what spec-tech pins.

**Whichever route, the check is the same and is not optional**: `node -v` and, where a manager is in
use, `nvm alias default` — separately, because they answer different questions and either can be the
wrong one (**SF-1**).

## The browser Playwright needs

```bash
npx playwright install chromium
```

✅ Downloads and launches under WSL with no `sudo` and no system package added.

**Never `--with-deps` here.** It shells out to `sudo apt-get` and hangs on a prompt nothing can
answer (setup-ai-env §3); the download itself needs no privileges. Why, and where the opposite is
correct, is in [lessons/playwright.md](lessons/playwright.md).

**On a barer machine the browser may still be missing system libraries.** Playwright names them when
it fails. Installing them needs the distro package manager, and therefore root.

## What only a person can do

Worth stating plainly, because an agent that meets one of these will otherwise appear to hang:

- **Anything needing `sudo`.** There is no stdin for a password prompt. System libraries, distro
  packages, anything at all as root — a person, at a terminal.
- **Anything that opens a browser to authenticate.** No browser inside WSL; see setup-ai-env §3 for
  the device-code and `BROWSER` workarounds, both of which a person sets up once.
- **Creating an SSH key and adding it to the remote.** Until that exists, pushes hang rather than
  fail (**SF-3**).

## Confirming the machine is ready

```bash
node -v                              # 24
npm ci && npm test                   # 12 passing, no browser needed
npm run check                        # tsc, clean
npm run test:e2e                     # 4 passing, builds and serves first
```

The last one is the real proof: it builds the application, serves the build, and asserts the page
reports a genuine commit rather than `unknown`. If it passes, every part of the toolchain that this
project uses has just run.
