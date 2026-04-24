#!/bin/bash
set -euo pipefail

PORT="${PORT:-18090}"
HOST="${HOST:-127.0.0.1}"
BASE_URL="http://${HOST}:${PORT}"
TMP_DIR="$(mktemp -d)"
PID=""

cleanup() {
  if [[ -n "${PID}" ]] && kill -0 "${PID}" 2>/dev/null; then
    kill "${PID}" 2>/dev/null || true
    wait "${PID}" 2>/dev/null || true
  fi
  rm -rf "${TMP_DIR}"
}
trap cleanup EXIT

echo "[smoke] building project"
npm run -s build >/dev/null

echo "[smoke] starting server on ${BASE_URL}"
PORT="${PORT}" HOST="${HOST}" TOOL_ROOT_DIR="${TMP_DIR}" node dist/entrypoints/server.js >"${TMP_DIR}/server.log" 2>&1 &
PID=$!

# wait for readiness
for _ in {1..40}; do
  if curl -fsS "${BASE_URL}/health" >/dev/null 2>&1; then
    break
  fi
  sleep 0.25
done

curl -fsS "${BASE_URL}/health" > "${TMP_DIR}/health.json"
python - "${TMP_DIR}/health.json" <<'PY'
import json,sys
with open(sys.argv[1], "r", encoding="utf-8") as f:
    data=json.load(f)
assert data.get("status")=="ok", data
print("[smoke] /health ok")
PY

curl -fsS "${BASE_URL}/status" > "${TMP_DIR}/status.json"
python - "${TMP_DIR}/status.json" <<'PY'
import json,sys
with open(sys.argv[1], "r", encoding="utf-8") as f:
    data=json.load(f)
assert data.get("status")=="active", data
assert "agentsCount" in data, data
print("[smoke] /status ok")
PY

AGENT_PAYLOAD='{"name":"smoke-agent","description":"smoke test agent","capabilities":["openai"]}'
curl -fsS -X POST "${BASE_URL}/agents" -H "Content-Type: application/json" -d "${AGENT_PAYLOAD}" > "${TMP_DIR}/agent.json"
python - "${TMP_DIR}/agent.json" <<'PY'
import json,sys
with open(sys.argv[1], "r", encoding="utf-8") as f:
    data=json.load(f)
assert data.get("id"), data
assert data.get("name")=="smoke-agent", data
print("[smoke] POST /agents ok")
PY

FILE_PATH="${TMP_DIR}/hello.txt"
WRITE_PAYLOAD=$(printf '{"tool":"file_write","input":{"path":"%s","content":"hello-smoke"}}' "${FILE_PATH}")
curl -fsS -X POST "${BASE_URL}/tool" -H "Content-Type: application/json" -d "${WRITE_PAYLOAD}" > "${TMP_DIR}/write.json"
python - "${TMP_DIR}/write.json" <<'PY'
import json,sys
with open(sys.argv[1], "r", encoding="utf-8") as f:
    data=json.load(f)
assert data.get("status")=="success", data
print("[smoke] POST /tool file_write ok")
PY

READ_PAYLOAD=$(printf '{"tool":"file_read","input":{"path":"%s"}}' "${FILE_PATH}")
curl -fsS -X POST "${BASE_URL}/tool" -H "Content-Type: application/json" -d "${READ_PAYLOAD}" > "${TMP_DIR}/read.json"
python - "${TMP_DIR}/read.json" <<'PY'
import json,sys
with open(sys.argv[1], "r", encoding="utf-8") as f:
    data=json.load(f)
assert data.get("status")=="success", data
assert data.get("data",{}).get("content")=="hello-smoke", data
print("[smoke] POST /tool file_read ok")
PY

echo "[smoke] all checks passed"
