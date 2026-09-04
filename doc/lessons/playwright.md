# Playwright — learnings

**Read this when [spec-tech.md](../spec-tech.md) names Playwright.** Nothing here is a choice.

## Never `--with-deps` locally; always `--with-deps` in CI

`npx playwright install --with-deps chromium` shells out to `sudo apt-get`. In a WSL shell there is
no stdin for the password prompt, so it **hangs rather than failing**, and nothing says what is being
waited for. Use the plain form:

```bash
npx playwright install chromium
```

**Confirmed here:** chromium downloaded and launched under WSL with no system package added and no
`sudo`.

**In CI the opposite is correct.** A runner has passwordless sudo and a barer image, so `--with-deps`
belongs there and the plain form can produce a browser missing system libraries. The two rules read
as contradictory and are not — say which machine you are on before choosing.

## The web server must bind the address the tests poll

A dev or preview server left to itself binds `localhost`, which resolves to `::1` on some machines
and `127.0.0.1` on others — while a `webServer.url` written as literal IPv4 is polled as IPv4. When
the two disagree the server **starts healthily on an address nothing is watching**, and Playwright
waits out its whole timeout before reporting *"Timed out waiting 120000ms from config.webServer"*.
That names the symptom and hides every cause.

**It cannot reproduce locally**, where both names lead to the same place, which is what makes it
expensive: it only ever fails in CI.

Bind and poll the same literal address, and set `stdout: 'pipe'` and `stderr: 'pipe'` on the
`webServer`. Swallowed, the server's own output is the thing that would have said which address it
took.

## A CI-only failure needs a reporter that leaves evidence

Job logs and run artifacts both need repository admin rights through the API, so a CI-only failure is
diagnosable by exactly one person, in a browser. **Annotations are readable on a public repository
without credentials**, and Playwright's `github` reporter emits one per failure.

```ts
reporter: process.env['CI'] ? [['github'], ['list'], ['html', { open: 'never' }]] : [['list']]
```

Add `trace: 'retain-on-failure'` and `screenshot: 'only-on-failure'` too. All three cost nothing on a
passing run, and without them a failure that cannot be reproduced locally leaves nothing to look at.

## Proving an assertion can fail costs one environment variable

Where a test asserts something a build stamped, `GIT_DIR` pointing at nothing makes `git rev-parse`
fail while everything else proceeds normally:

```bash
GIT_DIR=/nonexistent npx playwright test    # the identifier test must FAIL here
```

It needs no source change, so there is nothing to remember to put back.
