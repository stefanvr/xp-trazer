---
name: todo-discovery
description: Discover what is open in this project and record it as a dated snapshot in doc/discoveries/. Defines what counts as a TODO — an admitted gap, a contradiction, a dangling reference, an unowned decision kind — and what does not. Use when asked what is open, what is left, what the TODOs are, or to audit the documents against each other and against the repository.
---

# TODO discovery

**Owns.** What counts as a TODO here, where to look for one, and the shape a finding takes.

**Not here.** Which TODO to do next. That is the owner's call, and this routine deliberately does not
rank — *don't decide on the owner's behalf* ([guide-general.md](../../../doc/guide-general.md)). The
machine every command runs on is [setup-ai-env.md](../../../doc/setup-ai-env.md), and it is binding
here too.

**The greppable half is the smallest half.** In a project whose artefacts are mostly documents, the
findings are in what the documents say *about each other*. A discovery that only greps for the word
`TODO` reports that there is nothing to do.

---

## What a TODO is

Unfinished work **the project has already committed to**, that **the artefacts reveal**, and that
**names its own done**. Three tests, all of them:

- **Committed** — the project said it, in its own files. Not something you think would be good.
- **Cited** — you can name the file and line that proves it open. A finding without a citation is an
  opinion, and gets dropped rather than softened.
- **Finishable** — you can say in one sentence what would close it. *A goal without an edge can only
  be abandoned, not finished.*

### The four kinds

| Kind | The test |
|---|---|
| **Admitted gap** | A document states that a decision is not made. |
| **Contradiction** | Two documents say incompatible things. One of them is stale, and it goes on reading as authority until someone names it. |
| **Dangling reference** | A document names an artefact — file, directory, script, check, rule — that the repository does not have. |
| **Unowned kind** | A decision the project is actually making that no document owns, while the routing claims every kind is owned. |

## What a TODO is not

- **An idea nobody committed to.** A wish is a goal proposal; it goes in front of the owner, not into
  a list called open work.
- **The next link in a dependency chain.** *Being next in a dependency chain is not the same as being
  worth doing.*
- **Work deliberately not reached yet.** *Don't build, and don't specify, further than the goal in
  front of you needs.* An unwritten specification for a goal three ahead is the principle being
  followed. **This is the exclusion that gets missed most often** — absence is the normal state here,
  and a discovery that lists every absent thing hands the project its own method back as a fault.
- **A live decision that names its expiry.** An override with an *ends when* is being held, not left
  open.
- **An accepted state whose remedy is already written down.** `core.fileMode` starts noisy in a fresh
  clone; SF-12 says so and the session-start checklist repairs it. Written down and handled is closed.
- **Cosmetics.** A missing trailing newline has no done worth naming.

## Where to look

1. **Read every document end to end** — `doc/` and `.claude/CLAUDE.md`. Not grep: contradictions are
   prose, and prose does not announce itself.
2. **List every artefact any document names** — file, directory, script, command, check — and test
   that each exists. `git ls-files` against that list, not memory.
3. **List every claim one document makes about another's contents**, then open the other and read it.
   *"X is settled in Y"* is a claim about Y, and Y is where it is confirmed or broken.
4. **Follow the attributions.** *"A chose B"* asserts that A's file records B. Check A.
5. **Then grep** — `todo|fixme|tbd|not yet|not chosen|for now` — and expect it to find little.
6. **Once code exists**: markers in source, skipped or pending tests, and anything documentation
   claims the code does.

Every step reads the file. *Report what was verified, not what is believed — the two read identically
and only one of them is worth anything.*

## Recording

One file per run: `doc/discoveries/todo-<YYYY-MM-DD>.md`, entries numbered `D-n`, each carrying:

- **The claim** — one sentence, stated as fact about the project.
- **Kind** — one of the four.
- **Evidence** — file and line. A contradiction cites *both* sides.
- **Done when** — one sentence. If you cannot write it, it is not a TODO yet.

No priority, no estimate, no recommendation of what to take. Where one finding genuinely blocks
another, record that as a fact and keep it out of the entries, so ordering stays the owner's.

**Say what was examined and excluded**, with the reason. The exclusions are what make the list
trustworthy — without them a short list reads as a shallow look rather than a decided boundary.

## The result is derived, not decided

`doc/` holds documents that own decisions; a discovery owns none. It is a snapshot of what the
documents already say, so it can be regenerated by re-running this skill. Two consequences:

- **Do not maintain it.** Supersede it with a later run rather than editing it towards the truth.
- **Do not cite it as authority.** If a finding turns out to be a decision, it belongs in the document
  that owns that kind — and the entry disappears with the next run, which is the point.
