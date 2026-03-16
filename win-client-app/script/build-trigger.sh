#!/usr/bin/env bash
# build-trigger.sh — Trigger a Windows build via shared folder and wait for result
# Usage: bash win-client-app/script/build-trigger.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

TRIGGER_FILE="$PROJECT_DIR/.build-trigger"
RESULT_FILE="$PROJECT_DIR/.build-result"
LOG_FILE="$PROJECT_DIR/.build-log"
TIMEOUT=300  # seconds
POLL_INTERVAL=2  # seconds

# Clean previous results
rm -f "$RESULT_FILE" "$LOG_FILE"

# Write trigger
echo "trigger=$(date '+%Y-%m-%d %H:%M:%S')" > "$TRIGGER_FILE"
echo "Build triggered. Waiting for Windows build server..."

# Poll for result
elapsed=0
while [ ! -f "$RESULT_FILE" ]; do
    sleep "$POLL_INTERVAL"
    elapsed=$((elapsed + POLL_INTERVAL))
    if [ "$elapsed" -ge "$TIMEOUT" ]; then
        echo "ERROR: Build timed out after ${TIMEOUT}s"
        echo "Is build-server.ps1 running on the Windows VM?"
        exit 1
    fi
    # Progress indicator every 10s
    if [ $((elapsed % 10)) -eq 0 ]; then
        echo "  ...waiting (${elapsed}s)"
    fi
done

# Read result
echo ""
echo "=== Build Result ==="
cat "$RESULT_FILE"
echo ""

# Show log if present
if [ -f "$LOG_FILE" ]; then
    echo "=== Build Log (last 30 lines) ==="
    tail -30 "$LOG_FILE"
    echo ""
fi

# Check status (strip BOM and carriage returns from PowerShell output)
status=$(sed 's/\xEF\xBB\xBF//;s/\r//' "$RESULT_FILE" | grep '^status=' | cut -d= -f2)
if [ "$status" = "SUCCESS" ]; then
    # Zip is built in the main repo, not the worktree
    MAIN_PROJECT_DIR="$(cd "$SCRIPT_DIR" && git rev-parse --path-format=absolute --git-common-dir | sed 's|/\.git$||')/win-client-app"
    zip_file=$(find "$MAIN_PROJECT_DIR/dist" -maxdepth 1 -name 'EntropiaFlowClient_v*.zip' -newer "$RESULT_FILE" 2>/dev/null | head -1)
    if [ -z "$zip_file" ]; then
        # fallback: find most recent zip
        zip_file=$(ls -t "$MAIN_PROJECT_DIR"/dist/EntropiaFlowClient_v*.zip 2>/dev/null | head -1)
    fi
    if [ -n "$zip_file" ] && [ -f "$zip_file" ]; then
        size=$(du -h "$zip_file" | cut -f1)
        echo "Build successful! Zip: $zip_file ($size)"
    else
        echo "Build reported success but no zip found in: $MAIN_PROJECT_DIR/dist/"
        exit 1
    fi
else
    echo "Build failed. Check the log above for details."
    exit 1
fi
