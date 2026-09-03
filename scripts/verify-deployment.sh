#!/usr/bin/env bash
#
# Verifies a deployment by fetching the artefact and reading what it says about itself.
#
# SF-8 in doc/setup-ai-env.md: a host's control API can report "not enabled" and "not allowed to
# ask" identically, so asking it whether a deployment worked answers neither question. Fetching the
# page and comparing its build identifier to the commit we expect is the check that can only pass
# when the thing actually works.
#
# Usage: verify-deployment.sh <url> <expected-commit-sha>

set -euo pipefail

url="${1:?usage: verify-deployment.sh <url> <expected-commit-sha>}"
expected="${2:?usage: verify-deployment.sh <url> <expected-commit-sha>}"

echo "fetching ${url}"

# --retry-all-errors because a just-published deployment is briefly a 404 rather than an error.
page="$(curl --fail --silent --show-error --location \
  --retry 10 --retry-delay 6 --retry-all-errors \
  "${url}")"

identifier="$(printf '%s' "${page}" \
  | grep -o 'name="build-identifier" content="[^"]*"' \
  | head -1 \
  | sed 's/.*content="\([^"]*\)".*/\1/')"

if [ -z "${identifier}" ]; then
  echo "FAIL: the page carries no build-identifier meta tag at all" >&2
  exit 1
fi

if [ "${identifier}" = "unknown" ]; then
  echo "FAIL: the deployed page reports 'unknown' — it was built outside a repository (SF-7)" >&2
  exit 1
fi

if [ "${identifier}" != "${expected}" ]; then
  echo "FAIL: deployed ${identifier}, expected ${expected}" >&2
  echo "The deployment did not fail; it served an older build. That is the case worth catching." >&2
  exit 1
fi

echo "OK: the deployed page reports ${identifier}"
