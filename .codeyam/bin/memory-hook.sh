#!/bin/bash
# CodeYam Memory - Pre-commit Hook (BLOCKING)
# Ensures rules are reviewed when associated code changes
#
# This hook checks that rules with matching `paths` patterns have been reviewed
# (indicated by an updated `timestamp` field) when associated code files are modified.

set -e

RULES_DIR=".claude/rules"

# Skip if no rules directory
if [ ! -d "$RULES_DIR" ]; then
  exit 0
fi

# Get staged code files (added, copied, modified, renamed)
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR 2>/dev/null | grep -E '\.(ts|tsx|js|jsx)$' || true)

if [ -z "$STAGED_FILES" ]; then
  exit 0
fi

# Function to convert ISO 8601 timestamp to epoch seconds
# Handles both macOS and Linux date commands
timestamp_to_epoch() {
  local ts="$1"
  # Remove trailing Z if present
  ts="${ts%Z}"

  if date --version >/dev/null 2>&1; then
    # GNU date (Linux)
    date -d "$ts" +%s 2>/dev/null || echo "0"
  else
    # BSD date (macOS)
    # Handle ISO 8601 format: 2026-01-27T10:30:00
    date -j -f "%Y-%m-%dT%H:%M:%S" "$ts" +%s 2>/dev/null || echo "0"
  fi
}

# Function to get file modification time as epoch
get_file_mtime() {
  local file="$1"
  if [ ! -f "$file" ]; then
    echo "0"
    return
  fi

  if stat --version >/dev/null 2>&1; then
    # GNU stat (Linux)
    stat -c %Y "$file" 2>/dev/null || echo "0"
  else
    # BSD stat (macOS)
    stat -f %m "$file" 2>/dev/null || echo "0"
  fi
}

# Function to check if a file matches a glob pattern
# This is a simplified matcher - complex globs may not work perfectly
matches_pattern() {
  local file="$1"
  local pattern="$2"

  # Handle ** patterns by converting to simpler form
  # This is a simplification - proper glob matching would need a more robust solution
  local regex_pattern="$pattern"

  # Escape regex special chars except * and ?
  regex_pattern=$(echo "$regex_pattern" | sed 's/\./\\./g; s/\[/\\[/g; s/\]/\\]/g')

  # Convert glob patterns to regex
  # ** matches any path segment(s)
  regex_pattern=$(echo "$regex_pattern" | sed 's/\*\*/DOUBLESTAR/g')
  # * matches anything except /
  regex_pattern=$(echo "$regex_pattern" | sed 's/\*/[^/]*/g')
  # ** matches any path
  regex_pattern=$(echo "$regex_pattern" | sed 's/DOUBLESTAR/.*/g')
  # ? matches single char
  regex_pattern=$(echo "$regex_pattern" | sed 's/?/./g')

  # Anchor the pattern
  regex_pattern="^${regex_pattern}$"

  echo "$file" | grep -qE "$regex_pattern" 2>/dev/null
}

# Parse timestamp from YAML frontmatter
get_rule_timestamp() {
  local rule_file="$1"
  # Extract content between first two --- lines, then find timestamp
  sed -n '1,/^---$/!{/^---$/q;p}' "$rule_file" 2>/dev/null | \
    grep -E '^timestamp:' | \
    sed 's/timestamp:[[:space:]]*//' | \
    tr -d "'" | tr -d '"' | \
    head -1
}

# Parse paths from YAML frontmatter
get_rule_paths() {
  local rule_file="$1"
  # Extract the paths array from YAML frontmatter
  # This handles both inline array and multi-line array formats
  sed -n '1,/^---$/!{/^---$/q;p}' "$rule_file" 2>/dev/null | \
    sed -n '/^paths:/,/^[a-z]/p' | \
    grep -E "^[[:space:]]*-" | \
    sed "s/^[[:space:]]*-[[:space:]]*//" | \
    tr -d "'" | tr -d '"'
}

OUTDATED_RULES=""
CHECKED_RULES=""

# Find all rule files and check them
while IFS= read -r rule_file; do
  # Skip if already checked this rule
  if echo "$CHECKED_RULES" | grep -qF "$rule_file"; then
    continue
  fi
  CHECKED_RULES="$CHECKED_RULES $rule_file"

  rule_timestamp=$(get_rule_timestamp "$rule_file")

  # Skip rules without timestamp
  if [ -z "$rule_timestamp" ]; then
    continue
  fi

  rule_epoch=$(timestamp_to_epoch "$rule_timestamp")

  if [ "$rule_epoch" = "0" ]; then
    continue
  fi

  # Get paths for this rule
  rule_paths=$(get_rule_paths "$rule_file")

  if [ -z "$rule_paths" ]; then
    continue
  fi

  # Check each staged file against this rule's paths
  rule_is_outdated=false
  matched_file=""

  while IFS= read -r staged_file; do
    if [ -z "$staged_file" ]; then
      continue
    fi

    while IFS= read -r pattern; do
      if [ -z "$pattern" ]; then
        continue
      fi

      if matches_pattern "$staged_file" "$pattern"; then
        # Get file modification time
        file_epoch=$(get_file_mtime "$staged_file")

        # If file is newer than rule timestamp, flag it
        if [ "$file_epoch" -gt "$rule_epoch" ]; then
          rule_is_outdated=true
          matched_file="$staged_file"
          break 2
        fi
      fi
    done <<< "$rule_paths"
  done <<< "$STAGED_FILES"

  if [ "$rule_is_outdated" = true ]; then
    OUTDATED_RULES="$OUTDATED_RULES
    - $rule_file
      (matched: $matched_file)"
  fi

done < <(find "$RULES_DIR" -name "*.md" -type f 2>/dev/null)

if [ -n "$OUTDATED_RULES" ]; then
  echo ""
  echo "================================================================"
  echo "  Claude Rules (Codeyam Memory): Outdated Documentation Detected"
  echo "================================================================"
  echo ""
  echo "  The following rules have timestamps older than the code"
  echo "  files they cover:"
  echo "$OUTDATED_RULES"
  echo ""
  echo "  To proceed:"
  echo "    1. Review each rule to ensure it's still accurate"
  echo "    2. Update the 'timestamp' field in the YAML frontmatter"
  echo "    3. Stage the updated rule file(s)"
  echo "    4. Commit again"
  echo ""
  echo "  Or ask Claude to \"run \`codeyam memory status\` and follow the instructions.\""
  echo ""
  echo "================================================================"
  echo ""
  exit 1  # BLOCK the commit
fi

exit 0
