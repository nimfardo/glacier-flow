#!/usr/bin/env bash
# PreToolUse hook: enforces the XML task gate from .context/task-workflow.md.
# Blocks Edit/Write to gated paths (src/, reference/, .context/) unless the
# sentinel file .claude/gate-open exists. The sentinel is created when the user
# approves an XML task and deleted after the task's commit.
#
# Fails open (exit 0, allow the write) on any parse/resolution error --
# a broken hook should never be the reason a legitimate write gets stuck.

set -u

payload="$(cat)"

file_path="$(printf '%s' "$payload" | python3 -c '
import json, sys
try:
    data = json.load(sys.stdin)
    print(data.get("tool_input", {}).get("file_path", ""))
except Exception:
    print("")
' 2>/dev/null)"

[ -z "$file_path" ] && exit 0

project_dir="${CLAUDE_PROJECT_DIR:-$PWD}"
project_dir="$(cd "$project_dir" 2>/dev/null && pwd)"
[ -z "$project_dir" ] && exit 0

case "$file_path" in
  /*) full_path="$file_path" ;;
  *) full_path="$project_dir/$file_path" ;;
esac

full_path="$(python3 -c '
import os, sys
print(os.path.normpath(sys.argv[1]))
' "$full_path" 2>/dev/null)"
[ -z "$full_path" ] && exit 0

case "$full_path" in
  "$project_dir"/*) ;;
  *) exit 0 ;;
esac

rel="${full_path#"$project_dir"/}"

is_gated=0
for prefix in "src/" "reference/" ".context/"; do
  case "$rel" in
    "$prefix"*) is_gated=1; break ;;
  esac
done
[ "$is_gated" -eq 0 ] && exit 0

if [ -f "$project_dir/.claude/gate-open" ]; then
  exit 0
fi

echo "Gate closed: '$rel' is under the XML task gate (src/, reference/, .context/) and no approved task is open. Write the XML task per .context/task-workflow.md, get user approval, then create the sentinel: echo approved > .claude/gate-open. Delete the sentinel after the task's commit." >&2
exit 2
