#!/bin/bash
# Power Rules Pre-commit Hook
# Checks if modified code files have outdated corresponding rule files

set -e

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

# Track if any rules are stale
STALE_RULES=()

# Check each staged file against rules
while IFS= read -r file; do
  # Skip non-code files
  if [[ ! "$file" =~ \.(ts|tsx|js|jsx|py|rb|go|java|rs)$ ]]; then
    continue
  fi

  # Get modification time of the staged file
  if [ ! -f "$file" ]; then
    continue
  fi
  FILE_MTIME=$(stat -f %m "$file" 2>/dev/null || stat -c %Y "$file" 2>/dev/null)

  # Find rules that match this file
  while IFS= read -r rule; do
    if [ ! -f "$rule" ]; then
      continue
    fi

    # Extract paths from rule frontmatter
    RULE_PATHS=$(sed -n '/^paths:/,/^[a-z]/p' "$rule" | grep "  - " | sed "s/  - '//" | sed "s/'$//" | sed 's/"//g')

    # Check if file matches any rule path pattern
    MATCHES=false
    while IFS= read -r pattern; do
      # Convert glob pattern to regex (basic conversion)
      regex=$(echo "$pattern" | sed 's/\*\*/.*/' | sed 's/\*/[^\/]*/' | sed 's/\./\\./g')
      if [[ "$file" =~ ^$regex$ ]]; then
        MATCHES=true
        break
      fi
    done <<< "$RULE_PATHS"

    if [ "$MATCHES" = true ]; then
      # Extract timestamp from rule
      RULE_TIMESTAMP=$(grep "^timestamp:" "$rule" | sed 's/timestamp: //' | xargs)
      if [ -z "$RULE_TIMESTAMP" ]; then
        continue
      fi

      # Convert timestamp to epoch
      RULE_EPOCH=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$RULE_TIMESTAMP" +%s 2>/dev/null || date -d "$RULE_TIMESTAMP" +%s 2>/dev/null)

      # If rule is older than file, it's stale
      if [ "$RULE_EPOCH" -lt "$FILE_MTIME" ]; then
        STALE_RULES+=("$rule (affects $file)")
      fi
    fi
  done < <(find .claude/rules -name "*.md" 2>/dev/null)
done <<< "$STAGED_FILES"

# If there are stale rules, block the commit
if [ ${#STALE_RULES[@]} -gt 0 ]; then
  echo "⚠️  Power Rules Check Failed"
  echo ""
  echo "The following rule(s) are outdated and need review:"
  echo ""
  for rule in "${STALE_RULES[@]}"; do
    echo "  • $rule"
  done
  echo ""
  echo "To proceed:"
  echo "  1. Review the affected rule(s)"
  echo "  2. Update content if needed"
  echo "  3. Update the 'timestamp' field to current time (ISO 8601 format)"
  echo "  4. Stage the updated rule file(s)"
  echo "  5. Retry your commit"
  echo ""
  exit 1
fi

exit 0
