#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

PY=python3
if ! command -v python3 >/dev/null 2>&1; then
  if command -v python >/dev/null 2>&1; then
    PY=python
  else
    echo "SAMURA needs Python 3 to start its local server."
    echo "Install Python, or serve this folder with any static web server."
    exit 1
  fi
fi

REQUESTED="${PORT:-${1:-8000}}"

# Use the requested port, or the next free one if it is already taken.
PORT="$("$PY" - "$REQUESTED" <<'PY'
import socket
import sys

start = int(sys.argv[1])
for port in range(start, start + 30):
    sock = socket.socket()
    try:
        sock.bind(("", port))
    except OSError:
        sock.close()
        continue
    sock.close()
    print(port)
    break
else:
    sock = socket.socket()
    sock.bind(("", 0))
    print(sock.getsockname()[1])
    sock.close()
PY
)"

URL="http://localhost:${PORT}"

printf '\n  SAMURA\n  %s\n\n  Press Ctrl+C to stop.\n\n' "$URL"

if command -v xdg-open >/dev/null 2>&1; then
  ( sleep 1; xdg-open "$URL" >/dev/null 2>&1 || true ) &
elif command -v open >/dev/null 2>&1; then
  ( sleep 1; open "$URL" >/dev/null 2>&1 || true ) &
fi

exec "$PY" -m http.server "$PORT"
