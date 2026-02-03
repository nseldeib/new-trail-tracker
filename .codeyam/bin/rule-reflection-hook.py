#!/usr/bin/env python3
"""
Rule reflection hook for Claude Code.

Reads the session transcript to find new conversation since last check,
then prompts Claude to consider rule updates if there was substantive content.
"""

import json
import sys
from pathlib import Path

MIN_USER_TURNS = 5  # Fire after N user turns

def main():
    # Read hook input from stdin
    try:
        hook_input = json.load(sys.stdin)
    except json.JSONDecodeError:
        # No valid input, exit silently
        return

    session_id = hook_input.get('session_id', '')
    transcript_path = hook_input.get('transcript_path', '')
    stop_hook_active = hook_input.get('stop_hook_active', False)

    # Prevent infinite loops - if we're already in a stop hook continuation, exit silently
    if stop_hook_active:
        return

    if not session_id or not transcript_path:
        return

    # Marker file tracks last checked line per session
    marker_dir = Path('/tmp/claude-rule-markers')
    marker_dir.mkdir(exist_ok=True)
    marker_file = marker_dir / f'{session_id}.marker'

    # Read last checked line
    last_line = 0
    if marker_file.exists():
        try:
            last_line = int(marker_file.read_text().strip())
        except (ValueError, IOError):
            last_line = 0

    # Read transcript and get new lines
    try:
        with open(transcript_path, 'r') as f:
            all_lines = f.readlines()
    except IOError:
        return

    current_line_count = len(all_lines)
    new_lines = all_lines[last_line:]

    if not new_lines:
        return

    # Count user turns and extract conversation content from new lines
    user_turn_count = 0
    conversation_snippets = []

    for line in new_lines:
        try:
            obj = json.loads(line)
            msg_type = obj.get('type')

            if msg_type not in ('user', 'assistant'):
                continue

            message = obj.get('message', {})
            content = message.get('content', '')
            is_external_user = msg_type == 'user' and obj.get('userType') == 'external'

            # Handle string content
            if isinstance(content, str):
                # Skip meta messages and very short content
                if obj.get('isMeta') or len(content) < 20:
                    continue
                # Skip tool results (they show up as user messages)
                if content.startswith('[{') or '<tool_result' in content:
                    continue

                # Count substantive user turns
                if is_external_user and not content.startswith('<'):
                    user_turn_count += 1

                conversation_snippets.append({
                    'role': message.get('role', msg_type),
                    'content': content[:500]  # Truncate long messages
                })

            # Handle array content (tool calls, etc.)
            elif isinstance(content, list):
                for item in content:
                    if isinstance(item, dict):
                        if item.get('type') == 'text':
                            text = item.get('text', '')
                            if len(text) > 20:
                                conversation_snippets.append({
                                    'role': message.get('role', msg_type),
                                    'content': text[:500]
                                })
        except (json.JSONDecodeError, KeyError):
            continue

    # Only fire after enough user turns
    if user_turn_count < MIN_USER_TURNS:
        return

    # Update marker with current line count
    marker_file.write_text(str(current_line_count))

    # If not enough substantive conversation, exit silently
    if len(conversation_snippets) < 3:
        return

    # Build a summary of the recent conversation for the rule check
    summary_lines = []
    for snippet in conversation_snippets[-15:]:  # Last 15 messages
        role = snippet['role']
        content = snippet['content'].replace('\n', ' ')[:300]
        summary_lines.append(f"[{role}]: {content}")

    summary = '\n'.join(summary_lines)

    # Write detailed context to a file (keeps displayed output short)
    context_file = marker_dir / f'{session_id}.context'
    context = f"""Recent conversation to review for rule-worthy learnings:

{summary}

---
Guidelines:
- Did Claude get confused during this session in any way?
- How exactly did it get confused and what information would have resolved that confusion. No additional detail is needed especially if it is something that Claude likely already knows.
- Only update rules for patterns of confusion that will likely recur in future sessions.
- Document knowledge not easily evident from code
    - Locations of tests
    - Commands that can be run that are relevant to the task at hand
    - Architectural design, where to look for, fix, or add certain things
- Do not document bugs being fixed as they will likely be resolved.
- Issues that are abandoned as known issues can be noted.
- Keep rules concise (<50 lines), use bullets/tables where appropriate.
- Clean up, summarize, and delete existing rules as needed.
- If no changes are needed, just say "No rule updates needed."
"""
    context_file.write_text(context)

    # Output blocking decision - just trigger background agent
    # Keep reason minimal since main agent will spawn background worker
    output = {
        "decision": "block",
        "reason": f"RULE_CHECK:{context_file}"
    }
    print(json.dumps(output))

if __name__ == '__main__':
    main()
