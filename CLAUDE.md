# CLAUDE_CODE_EFFICIENCY_RULES

## 1. OUTPUT CONSTRAINTS (TOKEN SAVING)
- **Direct Answers:** No politeness, intros ("Sure!", "I understand"), or conclusions. Start immediately with the solution.
- **No Summaries:** Do not summarize what you did. The code/output is the summary.
- **Boolean Only:** If a task has a binary result, answer only "Success" or "Error: [reason]".
- **Extreme Conciseness:** Use bullet points. Avoid paragraphs. Use technical shorthand.
- **No Explanations:** Do not explain basic logic, syntax, or boilerplate unless explicitly asked.

## 2. CODING & TERMINAL RULES
- **Partial Edits Only:** Never rewrite entire files. Use `sed`, `grep`, or partial tool calls. Show only the modified lines using `// ...` for context.
- **Tool Usage:** Execute read-only commands (`ls`, `cat`, `grep`, `find`) without asking or explaining.
- **Grep First:** Always `grep` or `sed` to locate code before using `read_file` on large files.
- **No Echo:** Do not repeat the user's instructions or requirements back to them.

## 3. CONTEXT MANAGEMENT
- **Ignore Assets:** Automatically ignore `.json` locks, images, fonts, and build artifacts.
- **Limit Thinking:** (For 3.7) Minimize internal reasoning for trivial tasks (refactor, rename, simple bugs). Keep 'thinking' under 100 tokens if possible.
- **Manual Cleanup:** Remind the user to `/compact` or `/clear` if the conversation exceeds 15-20 turns.

## 4. LANGUAGE
- **Technical Spanish:** Answer in Spanish for logic, but use English for code, error logs, and technical terms to maintain byte-efficiency.