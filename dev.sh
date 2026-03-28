#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

backend_pid=""
frontend_pid=""

cleanup() {
  if [[ -n "${backend_pid}" ]]; then
    kill "${backend_pid}" 2>/dev/null || true
  fi
  if [[ -n "${frontend_pid}" ]]; then
    kill "${frontend_pid}" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

echo "Starting backend..."
(
  cd "${ROOT_DIR}/backend"
  npm run dev
) &
backend_pid=$!

echo "Starting frontend..."
(
  cd "${ROOT_DIR}/frontend"
  npm run dev
) &
frontend_pid=$!

wait "${backend_pid}" "${frontend_pid}"
