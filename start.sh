#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
if ! command -v node >/dev/null 2>&1; then
  runtime="$(pwd)/../../work/node-v22.23.4-linux-x64/bin"
  if [[ ! -x "$runtime/node" ]]; then
    echo 'Install Node.js 22.12 or newer, then run this script again.' >&2
    exit 1
  fi
  export PATH="$runtime:$PATH"
fi
if [[ ! -d node_modules ]]; then
  npm ci --cache "${TMPDIR:-/tmp}/saturday-scoreboard-npm-cache"
fi
exec npm run dev -- --port 5173 --strictPort
