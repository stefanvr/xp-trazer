# Development environment

**Owns.** How to AI interacts on this machine.

**Not here.** Technical *choices* — which runtime, which test framework, which host — belong in
[spec-tech.md](spec-tech.md). This document decides nothing; it records what is already true of the current machine developed on. That is why the two are separate: spec-tech changes when the project changes, this changes only
when the local machine changes in a way ai interaction changes, and mixing them makes both harder to trust.

**Naming a tool here is not choosing it.** Apart from git, every tool named below that in not in the spec-tech
can be ignored for now. Information is kept here as these are commonly used and lesson learned for AI interaction can be immediatly applied. 

**The lessons here arrived before the project did, and that is deliberate.** Every observation below
was made on *this machine*, and not necessarily on *this project*. So a passage may name a runtime, a
host, a CI or a file that this repository does not contain — read those as *"if and when it is that,
this is already known"*, and never as a record of what has been chosen or of what is in the tree.
**spec-tech is the only place a choice exists, and the only place to look for one.** Where a passage
below still reads as though a choice were settled, the passage is loose and spec-tech is right.
Keeping a lesson ahead of its subject costs nothing; acting on it before the choice exists costs a
wrong answer.

**Write the silent failures first.** A command that errors is self-correcting — you see it and fix
it. A command that quietly does the *wrong thing* is not, and that is the class of problem this
document exists for. Add it here in the same shape: what succeeded, what it actually did,
and the check that distinguishes the two. **The surprise is the valuable part** — a rule with no
observation behind it gets ignored by the third session.

**Keep personal details out of this file.** It is committed and may be public. Describe the
*failure mode* and how to check for it — never email addresses, SSH configuration, key names, or
absolute paths into someone's home directory. Everything below is written to be useful without
any of that.
---

## Machine:WIN-WSL - Working inside WSL from a Windows host — notes for an AI agent

Read it **before running any command**. It is about the local machine, and every rule here exists
because something succeeded while doing the wrong thing.

Portable: nothing below hardcodes a user or a distro. Substitute `<distro>`, `<user>` and  `<project>` from the
bootstrap block.

---

### 0. Bootstrap — run this first, every session

```bash
wsl.exe -l -q                                    # <distro>, e.g. Ubuntu-24.04
wsl.exe -e bash -ic 'set -u; echo $HOME; git config user.email'

# ...and the runtime. Where spec-tech chooses Node, nvm is this machine's way of having it:
wsl.exe -e bash -ic 'set -u; node -v; nvm alias default'
```

Do not trust a remembered answer for any of these. Check the **running** version and the **default**
separately — `node -v` and `nvm alias default` answer different questions and either can be the
wrong one (see **SF-1**).

---

### 1. The one rule

> **Every command that touches the project runs inside WSL, through an *interactive* shell.**

```bash
wsl.exe -e bash -ic 'set -u; cd /home/<user>/<project> && <command>'
```

`set -u` is not optional — see **SF-5**.

| Form | Effect |
|---|---|
| `bash -ic` | ✅ **Correct.** A shell-initialised version manager loads from the interactive startup file. |
| `bash -lc` | ❌ Login shell never loads it. Silently uses the **system-wide runtime** — often end-of-life. Node is managed by nvm on this machine, so this applies. |
| Git Bash / PowerShell on the Windows side, against a `\\wsl.localhost\…` path | ❌ Uses the **Windows** runtime and the Windows git identity. Both succeed and both are wrong. |

**The Windows side may touch file *content*, and nothing else.**

The line is not which files you reach, it is whether the command has to resolve a **toolchain or an
identity**. Reading, writing and editing a file resolves neither, so it is safe from Windows.
Running `git`, the runtime, the package manager, a test runner or a build resolves both — and
Windows has its own copy of each, which will answer, succeed, and be wrong (**SF-1**, **SF-2**).

| From the Windows side | |
|---|---|
| Read, write, edit a file · list or search file content | ✅ Allowed. This is what the `\\wsl.localhost\…` path is for. |
| `git`, the runtime, the package manager, tests, builds, package installs — anything invoking a project tool | ❌ Never. No exception, not even to "just check something quickly". |

| Path form | Use it for |
|---|---|
| `/home/<user>/<project>/…` | Everything executed, without exception: git, the runtime, the package manager, tests, builds |
| `\\wsl.localhost\<distro>\home\<user>\<project>\…` | **Only** reading, writing and editing file content |

The trap is that the forbidden half never announces itself. `git commit` from Windows does not warn
that it used a different identity; a test run from Windows does not warn that it used a different
runtime. Both print success. That is why the rule is a flat prohibition rather than a judgement
call — there is no observable difference at the moment you make the mistake.

---

### 2. Silent failures — commands that succeed while doing the wrong thing

This is the dangerous class. A command that errors is self-correcting; these are not.

#### SF-1 · The runtime version depends on your shell flags
Both invocations succeed and run different runtimes. `bash -lc` → system Node; `bash -ic` → nvm's.

**And installing a version is not selecting it.** A fresh interactive shell resolves to nvm's
**default alias**; `.nvmrc` is read only by an explicit `nvm use`. Install 24 while the default
alias points at 20 and every one-shot command runs 20, with `.nvmrc` and CI both saying 24.

Two ways out, not equivalent: `nvm use` in the project directory (scoped, reads `.nvmrc`) or
`nvm alias default <v>` (**global** — hits every other project on the machine).
Verify with `node -v` and `nvm alias default`, never by recalling what was installed.

#### SF-2 · Committing from Windows attributes the commit to the wrong person
The Windows host and WSL each carry their own global git identity, and on a work laptop they
usually differ. Git does not warn.
**Run every git command inside WSL.** Audit with `git log --format='%an <%ae>' | sort -u`.

**And it is not only git.** Every tool that authenticates does so independently, and on a work laptop
the accounts differ. Observed here: `firebase` was authenticated as the personal account that owns
the project, while `gcloud` on the same machine was authenticated as the *work* account, which has no
access to it. Neither tool mentions the other, and a one-line configuration fix aimed at the wrong
identity fails in a way that reads as a permissions problem with the project rather than as the wrong
login.

**Check each tool's identity separately, not once for the machine:**

```bash
git config user.email
npx firebase login:list
gcloud auth list
```

**This machine carries two `gcloud` configurations**, and only one is live at a time:

| Configuration | Account | Use |
|---|---|---|
| `default` | the work account | everything work-related |
| `personal` | the account that owns the Firebase project | this project |

The setting is **machine-wide, not per-terminal**, so leaving `personal` active means work commands
silently target this project, and leaving `default` active means this project's commands are refused
in a way that reads as "it may not exist". `gcloud config configurations list` shows both and which
is live; `gcloud config configurations activate <name>` switches.

The corollary is worth more than the check: **before fixing an access problem, ask which identity is
being refused.** Twice the cheaper answer has been to avoid the tool rather than re-authenticate it —
asking the live service directly, which needs no login at all.

**And the error will not tell you.** Observed: a `describe` on a resource, run as the wrong account,
returned *"Permission … denied on resource … **(or it may not exist)**"*. Denied and absent are the
same message, so the command answers neither question. This is **SF-8** in a second costume — a
provider API conflating "not allowed to ask" with "not there" — and the remedy is the same in
spirit: **establish the identity before running the check, because the check cannot establish it for
you.** A diagnostic run as the wrong identity is not a weak signal, it is no signal.

#### SF-3 · An HTTPS remote hangs instead of failing
It prompts for credentials no helper supplies, and waits forever on input that never arrives.
**Use SSH.** Confirm with `ssh -T git@github.com` — it names the authenticated account. *(GitHub is
named because that is where this repository's remote already is — a fact about the remote, not a
choice spec-tech has made; the check is the same shape wherever a remote lives.)*

**And when reading a remote anonymously to check something, set `GIT_TERMINAL_PROMPT=0`.** Without
it, a private repository does not report itself as private — git asks for a username and waits, which
is this same failure wearing a different hat.

#### SF-4 · Apostrophes and heredocs inside a command string break, and blame the wrong line
The outer `bash -c '…'` parses first, so a quoted heredoc does **not** protect you. Ordinary
English contractions are enough to trigger it.

Observed: error `line 127: unexpected EOF while looking for matching '` where line 127 was the end
of the document and the cause was *project's* far above.

**Never assemble file content inside a shell string. Use a file-writing tool** against the
`\\wsl.localhost\…` path. Same for git commit messages: write the message to a file, then
`git commit -F <file>`.

**And it is not only file content — the same layer eats command strings.** Observed repeatedly:
`wsl.exe -e bash -ic 'npm test; grep -E "tests|pass|fail" out.log'` reports *"Command 'pass' not
found"*, because the outer layer re-parsed the `|` inside the quoted pattern and ran the
alternatives as commands. A `sed 's/x/y/'` and a grep for `✔|✖` failed the same way. This one is
loud rather than silent, so it costs a round trip rather than a wrong answer — but the remedy is
worth having: **redirect to a file inside the shell, and read the file with a file-reading tool**
instead of filtering across the boundary. That is also what **SF-6** wants for exit codes, so one
habit settles both.

#### SF-5 · A variable can arrive empty across the boundary, and an unset variable expands to nothing
Observed: `R=…` then `cp -r $R/. target/` in the same string became `cp -r /. target/` — an attempt
to copy the filesystem root, which ran a while and left 3.4 GB of nonsense before failing on
something unrelated. Nothing warned; an empty expansion is a valid command.

Three cheap habits: **absolute paths, not variables**, across the boundary · **`set -u`** so an
unset variable aborts · best, **write a script to a file and run it**, since the quoting layer is
where this whole class lives.

#### SF-6 · A pipe swallows the exit code you are testing
```bash
some-cmd | head -5; echo $?     # ← reports head's status. Always 0.
```
Observed with `git ls-remote`: a **missing** repository read as success.
Redirect to a file and test the code directly, or check `${PIPESTATUS[0]}`.

#### SF-7 · A build outside a git repository succeeds and ships an unknown identifier
Any build that stamps the commit SHA by asking git will degrade to `unknown` when there is no
repository — exit 0, complete output, deployable artefact, nothing said.

**Order matters: `git init` and a first commit precede any build whose output is trusted.**
The end-to-end suite is the only thing that catches this, which is why it must assert the
identifier is **not** `unknown` rather than merely present. In CI the equivalent hazard is a
checkout with no history — a tarball export fails exactly this way. *(If CI turns out to be GitHub
Actions — spec-tech has chosen no CI — `actions/checkout` produces a real repository, so the build
can ask git for its commit. Assert that rather than assume it: the smoke test should run in CI and
fail on `unknown`.)*

**Proving that check works costs one environment variable.** A test that has never failed is a
claim, not evidence. `GIT_DIR` pointing at nothing makes `git rev-parse` fail while everything else
proceeds normally, which is this failure exactly — and it needs no source change, so there is
nothing to remember to put back:

```bash
GIT_DIR=/nonexistent npx playwright test    # the identifier test must FAIL here
```

Observed on an earlier project on this machine: the build still succeeded, stamped `unknown`, and the
smoke test caught it — *locator resolved to `<p data-testid="build-identifier">unknown</p>`*. Run it
whenever that
assertion changes, because it is the only assertion standing between a broken build and a shipped
one.

#### SF-8 · A provider API can report "not enabled" and "not allowed to ask" identically
*(observed on GitHub Pages on an earlier project — the generalisation below holds for
any host, and it is the check to verify this project's deployment with, once it has one.)* `GET /repos/{owner}/{repo}/pages` returns **404 unauthenticated even for a public repo with
Pages live**. Trusting it reports a working deployment as broken.

**Generalise: verify a deployment by fetching the artefact, not by asking the control API.** Fetch
the site and compare its build identifier to `main`. That is the check that can only pass when the
thing actually works.

#### SF-9 · Pushing a branch does not make it the remote's default
A host sets its own default from an account setting, or from whichever branch arrived first. It
never mentions the disagreement, and nothing local can detect it: every local command keeps working
while clones, pull requests and any CI that builds "the default branch" land on the other one.

**Read the default back from the host**, rather than inferring it from a push that succeeded. This
is the same shape as **SF-8** — the artefact is the answer, not the command that produced it.

#### SF-10 · A successful `npm install` can contain a failed config load
`npm install` runs the `prepare` script, so a project whose `prepare` reads the build configuration
loads that configuration *before* the dependencies it imports exist. The load fails, the error is
printed in full, and the install still exits 0.

Observed on the first install into a fresh scaffold: `ERR_MODULE_NOT_FOUND` for the adapter, then
*"No Svelte config file found — using SvelteKit's default configuration without an adapter"*, then
`added 56 packages`, exit 0. Nothing in the exit code separates that from a clean install, and the
next command to read the config gets the fallback rather than the configuration you wrote.

**Read the install output, not only its exit code**, and re-run the sync step after adding anything
the configuration imports.

#### SF-11 · A build from a dirty working tree stamps a commit that does not describe it
`git rev-parse HEAD` names the last commit, not the files that were actually compiled. Build with
uncommitted changes and the artefact carries an identifier that is *almost* true: right about the
history, wrong about the contents. Nothing marks the difference, and a deployment check that compares
the built identifier against the branch still passes — the identifier matches exactly as it is
supposed to.

Observed on an earlier project's first deployment: the working tree held uncommitted hosting
configuration while the built page reported the previous commit. Harmless that time, because nothing
uncommitted reached
the output — which is exactly why it is worth writing down, since the case that matters looks
identical from the outside.

**Deploy from a clean tree**, and let CI be what enforces it, a CI checkout being clean by
construction. Until then: `git status --porcelain` is empty, or you are not deploying.

#### SF-12 · The Windows side runs git by itself, and calls every executable modified
Section 1 forbids running git from the Windows side. VSCode's Source Control does it anyway —
continuously, and without being asked. It is the Windows git binary reading the working tree across
`\\wsl.localhost\…`, where POSIX permission bits are not visible, so every file committed `100755`
reads back as `100644` and shows as modified. For ever, with no content change.

Observed on `scripts/verify-deployment.sh`, the only executable file of an earlier project on this
machine — this repository has none yet: `755` and a clean `git status` in WSL; `old mode 100755 / new mode 100644` and a permanently dirty Source
Control view in VSCode. One file, one `.git`, two gits that cannot agree.

The visible half is harmless. The two quiet halves are not:

- `git commit -a` from that host strips the bit out of the committed tree, and nothing warns.
- **A working-tree indicator that is always dirty stops being read.** The noise trains you to ignore
  the one signal whose job is to show a real change — and **SF-11** deploys from a dirty tree.

Nothing is wrong with the file, so nothing done *to* the file repairs it: `git checkout` restores the
bit in WSL, and the Windows side calls it modified again immediately. The repair is in what git is
told.

```bash
git config --local core.fileMode false        # in WSL, like every other git command
```

Both hosts share one `.git/config`, so the one setting settles both. Only the *comparison* stops,
not the recording: the mode stays `100755` in the tree, and a fresh checkout is still executable —
verified with a throwaway worktree rather than assumed. The cost is that a genuinely new executable
records as `644`, and wants `git update-index --chmod=+x`.

**It is local configuration, so it is not committed, and a fresh clone starts noisy again.** That is
why it is in the session-start checklist below and not only here.

---

### 3. Tools that assume a desktop — these hang rather than fail

Nothing indicates what is being waited for, which is its own kind of time sink.

| Thing | Why | Do instead |
|---|---|---|
| Anything opening a browser (OAuth, cloud CLI sign-in) | No browser inside WSL | Use the tool's no-localhost / device-code flow, or once: `export BROWSER="/mnt/c/Program Files/Google/Chrome/Application/chrome.exe"` in the interactive startup file. WSL2 forwards Windows localhost, so the callback still lands. |
| Installing browser binaries with a `--with-deps`-style flag | `--with-deps` shells to `sudo apt-get`; no stdin for the password prompt | `npx playwright install chromium` — the download itself needs no privileges. **Confirmed here:** chromium downloaded and launched under WSL with no system package added and no `sudo`. Any equivalent tool: install the binary, skip the system-package step. |
| Long-running processes with a trailing `&` | A one-shot `wsl.exe` invocation tears down its children on exit; the server dies while the launch command looks successful | Use the calling tool's own backgrounding |
| Interactive git (`rebase -i`, `add -i`), `Read-Host`, pagers | No TTY | Non-interactive equivalents; `git --no-pager`, `\| cat` |

---

### 4. Working habits that follow from the above

- **Write files with a file-writing tool**, never a heredoc in a command string (**SF-4**).
- **Prefer a script file over a long inline command.** Write it, run it, delete it in the same
  session (**SF-5**).
- **Put scratch output outside anything a dev server watches** — use WSL `/tmp`, not the project
  tree. Otherwise the page reloads mid-run and the failure reads as an application bug.
- **Scratch leaves no trace.** A `_probe.js` left behind reads as real code to the next session.
  This governs scratch *files* — probes, dumps, generated output. Working *notes* are the opposite
  case and belong in `doc/scratchpad/`, in the tree and committed, where the deletion rule clears
  them when the goal lands.
- **Check the result, not the command's exit code**, wherever the two can disagree (**SF-6**,
  **SF-7**, **SF-8**).
- **Verify visually when there is anything to look at.** A passing test says the code ran, not that
  the output is right. Screenshot it and open the screenshot.
- **Scaffold into a temporary directory, then copy in what you want.** A project generator writes
  its own `README.md` and `.gitignore` over yours, and the flag that suppresses the *prompt* does
  not suppress the *overwrite*. Observed on an earlier project: `sv create --no-dir-check` would have
  replaced that project's README with the template's, and its `.gitignore` had to be appended rather
  than swapped in.
- **A generator's omissions are not decisions either.** The SvelteKit template ships no
  `@types/node`, so anything importing a `node:` builtin — the test runner, and the build config
  itself — runs correctly and fails `svelte-check`. A green test suite says nothing about this;
  only the type check does.
- **Do not trust a remembered environment fact.** Re-run the bootstrap block.

---

### 5. Session-start checklist

```bash
wsl.exe -e bash -ic 'set -u; cd /home/<user>/<project> || exit 1; \
  git config user.email; \
  git config --get core.fileMode; \
  git status --short; \
  ssh -T git@github.com 2>&1 | head -1'

# ...and the runtime, e.g.:
wsl.exe -e bash -ic 'set -u; cd /home/<user>/<project> || exit 1; \
  node -v; nvm alias default'
```

**Separated by `;`, not `&&`, and deliberately.** These are independent checks, and several of them
exit non-zero *precisely when you most need to see the rest*: `git config user.email` exits 1 when
unset, `git status` exits 128 outside a repository, and `ssh -T` exits 1 even on success. An `&&`
chain stops at the first bad answer and hides every check after it — the worst possible behaviour
for a diagnostic, and it fails hardest on a fresh machine where all of them matter. Only the `cd` is
hard, because every check after it is meaningless in the wrong directory.

**The `ssh` line reads output rather than an exit code, and that is not an SF-6 violation.** `ssh -T`
against a git host exits 1 on success; the greeting text is the only signal there is. Where output
is the answer, read output — SF-6 is about the case where the exit code is the answer and a pipe
quietly replaces it.

| Check | Good answer | Bad answer means |
|---|---|---|
| `git config user.email` | the identity that owns the repo | **SF-2** — commits will be misattributed |
| `git config --get core.fileMode` | `false` | **SF-12** — a fresh clone has not been told; VSCode will call every executable modified, and real changes hide in the noise |
| `git status --short` | a clean or expected working tree | not a repository yet — see **SF-7** before trusting any build |
| `ssh -T git@github.com` | `Hi <account>! You've successfully authenticated` | **SF-3** — pushes will hang, not fail |
| `node -v` | the version spec-tech pins, once it pins one; this machine currently has Node 24 LTS | **SF-1** — wrong runtime, results untrustworthy |
| `nvm alias default` | the same version as the line above | **SF-1** — next one-shot command reverts |

---

## Invariants

What must be true regardless of whose machine it is. Each `## Machine:` section above is one
machine's way of satisfying these.

- **A repository exists before anything is built.** It is the first scaffolding step, and the only
  one that precedes every other — a build outside a repository stamps an `unknown` identifier and
  still exits zero (**SF-7**).
- **Push access to the remote over SSH**, never HTTPS — an HTTPS remote hangs rather than fails
  (**SF-3**).


## When someone else joins

The section above is tuned to one person's setup, and that is a deliberate trade: for a solo project
the specifics *are* the value, and a generic version would lose exactly the part worth having.

It does not survive contact with a contributor whose environment differs. When that happens, do not
genericise it into vagueness — **promote whatever actually matters up into Invariants**, and let
each person's setup satisfy those however it does. Add a second
`## Machine:<machine-config-name> - <description>` section rather than merging them into a
description that fits neither.

The invariants were always the shared part. The rest was only ever one machine's answer to them.
