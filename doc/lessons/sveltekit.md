# SvelteKit — learnings

**Read this when [spec-tech.md](../spec-tech.md) names SvelteKit.** Nothing here is a choice. This
project does not use it; the file is a lesson held for the project that does.

## The generator overwrites your files, and the flag that stops the prompt does not stop the write

`sv create --no-dir-check` suppresses the *prompt*, not the *overwrite*. Observed on an earlier
project: it would have replaced that project's `README.md` with the template's, and its `.gitignore`
had to be appended to rather than swapped in.

**Scaffold into a temporary directory, then copy in what you want.** That is the general habit; this
is the tool that made it necessary.

## A generator's omissions are not decisions either

The template ships no `@types/node`, so anything importing a `node:` builtin — the test runner, and
the build configuration itself — runs correctly and fails `svelte-check`.

**A green test suite says nothing about this.** Only the type check does, which is the argument for
running one at all.

## Its `prepare` script is what makes `npm install` lie

See `node.md`: `npm install` runs `prepare`, SvelteKit's `prepare` reads the build configuration, and
the configuration imports an adapter that is not installed yet. The load fails, the error prints, and
the install exits 0 with the default configuration silently in place.
