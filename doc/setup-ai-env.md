# AI environment

**Owns.** How an AI agent interacts with this machine, and which of its commands succeed while doing
the wrong thing.

**Not here.** Technical *choices* — which runtime, which test framework, which host — belong in
[spec-tech.md](spec-tech.md) · bringing a machine from nothing to able to develop, and what only a
person can do, is [setup-dev-env.md](setup-dev-env.md) · where the application runs is
[setup-app-env.md](setup-app-env.md). This document assumes the machine already works and asks what
lies to you; setup-dev-env assumes nothing is installed and asks what to run.

**This document decides nothing.** It records what is true of the machine. spec-tech changes when the
project changes; this changes only when the machine changes in a way that changes how an agent works
on it. Mixing them makes both harder to trust.

**Everything here is true whatever the project is built with.** A lesson that depends on a technology
lives in `doc/lessons/`, one file per technology, named as [spec-tech.md](spec-tech.md) names it.

> **Read the lesson file for each technology spec-tech chooses, and no others.** A file for a
> technology this project does not use is a lesson held for the project that does — not a choice,
> and not a plan.

**Which those are is listed in [CLAUDE.md](../.claude/CLAUDE.md)**, so that finding out costs nothing
at session start. That list is an index and this rule is the authority: where they disagree, the list
is wrong.

**Every machine section is in two halves, and the halves are what a session pays.** The **rules** are
what a session needs before it can work here, and on a machine already known to work they are all it
reads. The **evidence** is why each rule exists — read when a check answers badly, when something
surprises you, or when the machine changes.

**What this file is worth reading for is below the marker, and how to add to it is down there too** —
both are read at the moment you have something to add, which is not every session.

---

# Machine:WIN-WSL — working inside WSL from a Windows host

Portable: nothing below hardcodes a user or a distro. Substitute `<distro>`, `<user>` and `<project>`
from the bootstrap block.

## Rules — all a session reads on a machine already known to work

### The one rule

> **Every command that touches the project runs inside WSL, through an *interactive* shell.**

```bash
wsl.exe -e bash -ic 'set -u; cd /home/<user>/<project> && <command>'
```

| Form | Effect |
|---|---|
| `bash -ic` | ✅ **Correct.** A shell-initialised version manager loads from the interactive startup file. |
| `bash -lc` | ❌ Login shell never loads it. Silently uses the **system-wide runtime** — often end-of-life. |
| Git Bash / PowerShell on the Windows side, against a `\\wsl.localhost\…` path | ❌ Uses the **Windows** toolchain and the Windows git identity. Both succeed and both are wrong. |

**The Windows side may touch file *content*, and nothing else.** The line is not which files you
reach, it is whether the command has to resolve a **toolchain or an identity**.

| From the Windows side | |
|---|---|
| Read, write, edit a file · list or search file content | ✅ Allowed. This is what the `\\wsl.localhost\…` path is for. |
| `git`, the runtime, the package manager, tests, builds, package installs — anything invoking a project tool | ❌ Never. No exception, not even to "just check something quickly". |

| Path form | Use it for |
|---|---|
| `/home/<user>/<project>/…` | Everything executed, without exception |
| `\\wsl.localhost\<distro>\home\<user>\<project>\…` | **Only** reading, writing and editing file content |

### The working rules

Each cites where its observation is. **`set -u` is not optional.**

| Rule | Because | Evidence |
|---|---|---|
| `set -u` in every command string, and absolute paths rather than variables | an unset variable expands to nothing, and the command still runs | SF-5 |
| Never assemble file content in a shell string — write it with a file-writing tool | the outer layer parses first, and an apostrophe truncates the content silently | SF-4 |
| Write a commit message to a file the repository ignores, then `git commit -F <file>` | the same layer, and a truncated message commits with exit status zero | SF-4 |
| Do not filter across the boundary — redirect to a file inside the shell and read the file | the outer layer re-parses a `\|` inside a quoted pattern and runs the halves as commands | SF-4, SF-6 |
| Prefer a script file over a long inline command; delete it in the same session | the quoting layer is where this whole class of failure lives | SF-4, SF-5 |
| Check the result, not the exit code, wherever the two can disagree | a pipe reports the last command's status, and a build can exit 0 having stamped nothing | SF-6, SF-7, SF-8 |
| Use SSH for remotes, and `GIT_TERMINAL_PROMPT=0` when reading one anonymously | an HTTPS remote hangs on a prompt that nothing answers | SF-3 |
| A repository exists, with a commit, before anything is built | a build outside one stamps `unknown` and still exits 0 | SF-7 |
| Deploy only from a clean tree — `git status --porcelain` empty | a dirty tree stamps a commit that describes the history and not the files | SF-11 |
| Verify a deployment by fetching the artefact, never by asking the host's control API | it answers *not there* and *not allowed to ask* identically | SF-8 |
| Read a remote's default branch back from the host, rather than inferring it from a push | pushing a branch does not make it the default, and nothing local can tell | SF-9 |
| Put scratch output outside anything a dev server watches, and leave none of it behind | a reload mid-run reads as an application bug, and a leftover probe reads as real code | §4 |
| Verify through the suite, never by driving the product by hand | [guide-general.md](guide-general.md) owns the principle; §4 has what it costs here | §4 |
| Do not trust a remembered environment fact — re-run the checks below | | §0 |

**Four things hang rather than fail**, with nothing indicating what is being waited for: anything that
opens a browser, any step that shells out to `sudo`, a long-running process backgrounded with a
trailing `&`, and interactive git or a pager. §3 has what to do instead of each.

### The checks a session runs

```bash
wsl.exe -l -q                                    # <distro>, e.g. Ubuntu-24.04
wsl.exe -e bash -ic 'set -u; cd /home/<user>/<project> || exit 1; \
  echo $HOME; \
  git config user.email; \
  git config --get core.fileMode; \
  git status --short; \
  ssh -T git@github.com 2>&1'
```

Separated by `;` and not `&&`, deliberately — several of these exit non-zero precisely when you most
need to see the rest (§5). Only the `cd` is hard.

| Check | Good answer | A bad answer means |
|---|---|---|
| `git config user.email` | the identity that owns the repo | **SF-2** — commits will be misattributed |
| `git config --get core.fileMode` | `false` | **SF-12** — a fresh clone has not been told; VSCode will call every executable modified, and real changes hide in the noise |
| `git status --short` | a clean or expected working tree | not a repository yet — see **SF-7** before trusting any build |
| `ssh -T git@github.com` | `Hi <account>! You've successfully authenticated` | **SF-3** — pushes will hang, not fail |
| the runtime version | what [spec-tech.md](spec-tech.md) pins | **SF-1** — wrong toolchain, results untrustworthy |
| the version manager's default | the same as the line above | **SF-1** — the next one-shot command reverts |

The last two are the runtime's own commands, and its lesson file gives them.

### When to read the evidence half

- A check above answered something other than its good answer.
- Something surprised you — a command succeeded and did the wrong thing.
- The machine changed, or it is a different machine.
- This session will **scaffold, install, deploy, or debug CI** for the first time. §3 and §4 hold
  rules that only come up there, and they are not repeated above.

<!-- The rules half ends here. Everything below is the evidence for it. -->

---

## Evidence — why each rule exists, and how to add one

### Maintaining this document

**Write the silent failures first.** A command that errors is self-correcting — you see it and fix
it. A command that quietly does the *wrong thing* is not, and that is the class of problem this
document exists for. Add one in the same shape: what succeeded, what it actually did, and the check
that distinguishes the two. **The surprise is the valuable part** — a rule with no observation behind
it gets ignored by the third session.

**So a rule is stated in the rules half and its observation here, never both.** The number is the
join. A rule written out twice goes stale in one of the two, and a document set has no build to catch
it — which is the failure this whole set exists to fight.

**A number, once issued, is never reused.** These are cited from other documents, from the workflow
and from the code. A lesson that moves to `doc/lessons/` leaves its number here pointing at where it
went, so a citation resolves to the lesson it meant or to nothing, never to a different one.

**Keep personal details out of this file.** It is committed and public. Describe the *failure mode*
and how to check for it — never email addresses, SSH configuration, key names, or absolute paths into
someone's home directory.

### 0. Why the checks are re-run rather than remembered

Do not trust a remembered answer. Where the project's runtime is managed by a version manager, check
the **running** version and the **default** separately — they answer different questions and either
can be the wrong one (see **SF-1**, and the lesson file for that runtime).

### 1. Why the one rule is a flat prohibition rather than a judgement call

The trap is that the forbidden half never announces itself. `git commit` from Windows does not warn
that it used a different identity; a test run from Windows does not warn that it used a different
runtime. Both print success. There is no observable difference at the moment you make the mistake.

### 2. Silent failures — commands that succeed while doing the wrong thing

This is the dangerous class. A command that errors is self-correcting; these are not.

#### SF-1 · The toolchain version depends on your shell flags
Both invocations succeed and run different toolchains. `bash -lc` loads no version manager and gets
the system-wide one; `bash -ic` gets the managed one.

**Verify, never recall.** Which version is running and which one the next fresh shell will pick are
two questions, and a version manager can answer them differently. *The commands that ask are the
runtime's — see its lesson file.*

#### SF-2 · Committing from Windows attributes the commit to the wrong person
The Windows host and WSL each carry their own global git identity, and on a work laptop they usually
differ. Git does not warn. Audit with `git log --format='%an <%ae>' | sort -u`.

**And it is not only git.** Every tool that authenticates does so independently, and on a work laptop
the accounts differ — so **check each tool's identity separately, never once for the machine**. The
worked example, where two cloud tools on this machine were logged in as different people, is in
[lessons/firebase.md](lessons/firebase.md).

#### SF-3 · An HTTPS remote hangs instead of failing
It prompts for credentials no helper supplies, and waits forever on input that never arrives.
Confirm SSH with `ssh -T git@<host>` — it names the authenticated account.

Reading a remote anonymously is the same failure wearing a different hat: without
`GIT_TERMINAL_PROMPT=0`, a private repository does not report itself as private — git asks for a
username and waits.

#### SF-4 · Apostrophes and heredocs inside a command string break, and blame the wrong line
The outer `bash -c '…'` parses first, so a quoted heredoc does **not** protect you. Ordinary
English contractions are enough to trigger it.

Observed: error `line 127: unexpected EOF while looking for matching '` where line 127 was the end
of the document and the cause was *project's* far above.

**It does not always announce itself.** Observed: a `git commit -F -` fed by a heredoc whose message
contained *surface's*. The apostrophe closed the outer string, so git received the message truncated
at that word — and **committed and pushed it**, exit status zero, the tail of the message appearing
only as two stray `command not found` lines that read like unrelated noise. The parse error is the
lucky case; the silent one ships.

The commit-message file needs **a name the repository ignores**, or the next `git add -A` commits the
message alongside the change it describes.

**And it is not only file content — the same layer eats command strings.** Observed repeatedly:
`wsl.exe -e bash -ic 'npm test; grep -E "tests|pass|fail" out.log'` reports *"Command 'pass' not
found"*, because the outer layer re-parsed the `|` inside the quoted pattern and ran the
alternatives as commands. A `sed 's/x/y/'` and a grep for `✔|✖` failed the same way. This one is
loud rather than silent, so it costs a round trip rather than a wrong answer.

#### SF-5 · A variable can arrive empty across the boundary, and an unset variable expands to nothing
Observed: `R=…` then `cp -r $R/. target/` in the same string became `cp -r /. target/` — an attempt
to copy the filesystem root, which ran a while and left 3.4 GB of nonsense before failing on
something unrelated. Nothing warned; an empty expansion is a valid command.

#### SF-6 · A pipe swallows the exit code you are testing
```bash
some-cmd | head -5; echo $?     # ← reports head's status. Always 0.
```
Observed with `git ls-remote`: a **missing** repository read as success. Where you cannot avoid the
pipe, check `${PIPESTATUS[0]}`.

#### SF-7 · A build outside a git repository succeeds and ships an unknown identifier
Any build that stamps the commit SHA by asking git will degrade to `unknown` when there is no
repository — exit 0, complete output, deployable artefact, nothing said.

**Order matters: `git init` and a first commit precede any build whose output is trusted.** The
end-to-end suite is the only thing that catches this, which is why it must assert the identifier is
**not** `unknown` rather than merely present. In CI the equivalent hazard is a checkout with no
history — a tarball export fails exactly this way, while a real checkout does not. *What the chosen
CI actually produces is its lesson file's to say.*

**Proving that check works costs one environment variable.** A test that has never failed is a claim,
not evidence. Break git's view of the repository and the build stamps `unknown` while everything else
proceeds normally, which is this failure exactly — and it needs no source change, so there is nothing
to remember to put back. *The command is the test runner's — see its lesson file.*

Observed on an earlier project: the build succeeded, stamped `unknown`, and the smoke test caught it —
*locator resolved to `<p data-testid="build-identifier">unknown</p>`*. Re-run that proof whenever the
assertion changes, because it is the only assertion standing between a broken build and a shipped
one.

#### SF-8 · A provider API can report "not enabled" and "not allowed to ask" identically
A host's control API can answer a question about a deployment with a status that means either *it is
not there* or *you are not allowed to ask*. Trusting it reports a working deployment as broken, and
no second reading separates the two.

Fetch the thing and compare its build identifier to the commit you expect. That is the check that can
only pass when it actually works, and it is what this project's deployment is verified with. *The
host's own version of this — which endpoint lies, and what its answers mean — is in its lesson file.*

#### SF-9 · Pushing a branch does not make it the remote's default
A host sets its own default from an account setting, or from whichever branch arrived first. It
never mentions the disagreement, and nothing local can detect it: every local command keeps working
while clones, pull requests and any CI that builds "the default branch" land on the other one.

This is the same shape as **SF-8** — the artefact is the answer, not the command that produced it.

#### SF-10 · Moved
*A successful package install can contain a failed config load.* It belongs to a package manager
rather than to this machine, and is now in [lessons/node.md](lessons/node.md). The number stays so
older citations still resolve.

#### SF-11 · A build from a dirty working tree stamps a commit that does not describe it
`git rev-parse HEAD` names the last commit, not the files that were actually compiled. Build with
uncommitted changes and the artefact carries an identifier that is *almost* true: right about the
history, wrong about the contents. Nothing marks the difference, and a deployment check that compares
the built identifier against the branch still passes — the identifier matches exactly as it is
supposed to.

Observed on an earlier project's first deployment: the working tree held uncommitted hosting
configuration while the built page reported the previous commit. Harmless that time, because nothing
uncommitted reached the output — which is exactly why it is worth writing down, since the case that
matters looks identical from the outside.

Let CI be what enforces the clean tree, a CI checkout being clean by construction.

#### SF-12 · The Windows side runs git by itself, and calls every executable modified
The rules half forbids running git from the Windows side. VSCode's Source Control does it anyway —
continuously, and without being asked. It is the Windows git binary reading the working tree across
`\\wsl.localhost\…`, where POSIX permission bits are not visible, so every file committed `100755`
reads back as `100644` and shows as modified. For ever, with no content change.

Observed on `scripts/verify-deployment.sh`, this repository's only executable file: `755` and a clean
`git status` in WSL; `old mode 100755 / new mode 100644` and a permanently dirty Source Control view
in VSCode. One file, one `.git`, two gits that cannot agree.

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
why it is one of the checks a session runs, and not only written here.

### 3. Tools that assume a desktop — these hang rather than fail

Nothing indicates what is being waited for, which is its own kind of time sink.

| Thing | Why | Do instead |
|---|---|---|
| Anything opening a browser (OAuth, cloud CLI sign-in) | No browser inside WSL | Use the tool's no-localhost / device-code flow, or once: `export BROWSER="/mnt/c/Program Files/Google/Chrome/Application/chrome.exe"` in the interactive startup file. WSL2 forwards Windows localhost, so the callback still lands. |
| Any install step that shells out to `sudo` | No stdin for the password prompt | Find the form that skips the privileged step — a download usually needs no privileges. *Which flag does that is the tool's lesson file.* |
| Long-running processes with a trailing `&` | A one-shot `wsl.exe` invocation tears down its children on exit; the server dies while the launch command looks successful | Use the calling tool's own backgrounding |
| Interactive git (`rebase -i`, `add -i`), `Read-Host`, pagers | No TTY | Non-interactive equivalents; `git --no-pager`, `\| cat` |

### 4. Habits, and what they cost here

- **Scratch leaves no trace.** A `_probe.js` left behind reads as real code to the next session.
  This governs scratch *files* — probes, dumps, generated output. Working *notes* are the opposite
  case and belong in `doc/scratchpad/`, in the tree and committed, and cleared when the goal lands.
  The `land` skill carries that rule and the test that licenses the deletion.
- **Scratch output goes outside anything a dev server watches** — use WSL `/tmp`, not the project
  tree. Otherwise the page reloads mid-run and the failure reads as an application bug.
- **Verification runs through the suite, not through a page driven by hand.**
  [guide-general.md](guide-general.md) owns that principle; what this machine adds is the price. An
  ad-hoc check here costs a build, a server and a browser across the WSL boundary, it holds the
  session for as long as it runs, and it leaves nothing that can be re-run. Where a screenshot is
  the evidence, it belongs to the browser suite, which already keeps one on failure.
- **Scaffold into a temporary directory, then copy in what you want.** A project generator writes
  its own `README.md` and `.gitignore` over yours, and the flag that suppresses the *prompt* does
  not suppress the *overwrite*.
- **A generator's omissions are not decisions either.** What a template leaves out can compile and
  still fail a type check, and a green test suite says nothing about it.

### 5. Why the checks are separated by `;` and not `&&`

They are independent, and several of them exit non-zero *precisely when you most need to see the
rest*: `git config user.email` exits 1 when unset, `git status` exits 128 outside a repository, and
`ssh -T` exits 1 even on success. An `&&` chain stops at the first bad answer and hides every check
after it — the worst possible behaviour for a diagnostic, and it fails hardest on a fresh machine
where all of them matter. Only the `cd` is hard, because every check after it is meaningless in the
wrong directory.

**The `ssh` line reads output rather than an exit code, and that is not an SF-6 violation.** `ssh -T`
against a git host exits 1 on success; the greeting text is the only signal there is. Where output
is the answer, read output — SF-6 is about the case where the exit code is the answer and a pipe
quietly replaces it.

---

## Invariants

What must be true regardless of whose machine it is. Each `# Machine:` section above is one
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
`# Machine:<machine-config-name> — <description>` section rather than merging them into a
description that fits neither. **It gets its own two halves**, and a session reads the rules half of
the machine it is on.

The invariants were always the shared part. The rest was only ever one machine's answer to them.
