# Firebase and gcloud — learnings

**Read this when [spec-tech.md](../spec-tech.md) names Firebase or Google Cloud.** Nothing here is a
choice. This project does not use either; the file is a lesson held for the project that does.

## Every tool that authenticates does so independently

Observed: `firebase` was authenticated as the personal account that owns the project, while `gcloud`
on the same machine was authenticated as the *work* account, which has no access to it. Neither tool
mentions the other, and a one-line configuration fix aimed at the wrong identity fails in a way that
reads as a permissions problem with the project rather than as the wrong login.

**Check each tool's identity separately, never once for the machine:**

```bash
git config user.email
npx firebase login:list
gcloud auth list
```

## A gcloud configuration is machine-wide, not per-terminal

Where a machine carries two configurations — say a work one and a personal one — only one is live at
a time, for every terminal at once. Leaving the personal one active means work commands silently
target the personal project; leaving the work one active means the personal project's commands are
refused in a way that reads as *"it may not exist"*.

`gcloud config configurations list` shows both and which is live;
`gcloud config configurations activate <name>` switches.

## The error will not tell you which it was

Observed: a `describe` on a resource, run as the wrong account, returned *"Permission … denied on
resource … **(or it may not exist)**"*. Denied and absent are the same message, so the command
answers neither question.

**Establish the identity before running the check, because the check cannot establish it for you.** A
diagnostic run as the wrong identity is not a weak signal; it is no signal.

The corollary is worth more than the check: **before fixing an access problem, ask which identity is
being refused.** Twice the cheaper answer has been to avoid the tool rather than re-authenticate it —
asking the live service directly, which needs no login at all.
