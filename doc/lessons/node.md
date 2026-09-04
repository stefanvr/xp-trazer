# Node — learnings

**Read this when [spec-tech.md](../spec-tech.md) names Node.** Nothing here is a choice; the choice
is spec-tech's. If this project does not use Node, this file is a lesson held for the project that
does.

## Installing a version is not selecting it

A fresh interactive shell resolves to the version manager's **default alias**. `.nvmrc` is read only
by an explicit `nvm use`. Install 24 while the default alias points at 20, and every one-shot command
runs 20 while `.nvmrc` and CI both say 24 — with nothing anywhere reporting the disagreement.

Two ways out, and they are not equivalent: `nvm use` in the project directory is scoped and reads
`.nvmrc`; `nvm alias default <v>` is **global** and hits every other project on the machine.

**Verify with `node -v` and `nvm alias default` separately.** They answer different questions — what
is running now, and what the next fresh shell will run — and either can be the wrong one.

This is the technology half of `setup-ai-env.md`'s rule that a version manager loads only in an
interactive shell.

## A successful `npm install` can contain a failed config load

`npm install` runs the `prepare` script, so a project whose `prepare` reads the build configuration
loads that configuration *before* the dependencies it imports exist. The load fails, the error prints
in full, and the install still exits 0.

Observed on a first install into a fresh scaffold: `ERR_MODULE_NOT_FOUND` for the adapter, then *"No
Svelte config file found — using SvelteKit's default configuration without an adapter"*, then `added
56 packages`, exit 0. Nothing in the exit code separates that from a clean install, and the next
command to read the config gets the fallback rather than the configuration you wrote.

**Read the install output, not only its exit code**, and re-run the sync step after adding anything
the configuration imports.

## `npm ci`, not `npm install`, when you did not mean to change anything

`ci` installs exactly what the lockfile says and fails if `package.json` and the lockfile disagree.
`install` quietly resolves something newer.
