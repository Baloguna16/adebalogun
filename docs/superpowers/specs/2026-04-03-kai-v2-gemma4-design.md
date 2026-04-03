# Kai v2 — Gemma-4 on Ollama

## Overview

Rebuild Kai (Kunle AI) from the ground up. Replace DeepSeek-R1 + llama.cpp with Google's Gemma-4 (`gemma4:e4b`) served via Ollama. Structured tool calling replaces fragile text parsing. Same CLI experience, dramatically simpler internals.

## Goals

- Drop-in replacement for the `kai` command — same UX, better reliability
- Native tool calling via Ollama's `/api/chat` endpoint (no more regex parsing)
- Clean 3-file module split instead of a 1,259-line monolith
- Persistent model process (Ollama daemon) eliminates cold-start per query

## Non-Goals

- Multi-model/backend support (Ollama only, gemma-4 only)
- Web search or external API tools
- GUI or TUI beyond the current terminal streaming

---

## Architecture

### System Diagram

```
┌──────────┐    HTTP     ┌──────────────┐    GPU    ┌───────────┐
│  kai CLI  │ ────────── │ Ollama daemon │ ──────── │ gemma4:e4b│
│ (Python)  │  :11434    │  (background) │  Metal   │  (model)  │
└──────────┘             └──────────────┘           └───────────┘
     │
     ├── tools.py  (read_file, write_file, list_files)
     ├── ollama.py (API client, streaming, tool call handling)
     └── kai.py    (CLI, agentic loop, sessions, memories, logs)
```

### File Structure

```
~/Projects/kai/
├── kai.py          # CLI entrypoint, arg parsing, agentic loop, sessions, memories, logging
├── ollama.py       # Ollama HTTP API client
├── tools.py        # Tool registry and implementations
├── sessions/       # Markdown conversation logs (migrated from old project)
├── memories/       # Memory notes (migrated from old project)
└── logs/           # Per-query JSON logs (migrated from old project)
```

---

## Components

### 1. Ollama API Client (`ollama.py`)

Single-purpose module wrapping Ollama's `/api/chat` endpoint.

**Constants:**
- `OLLAMA_BASE_URL = "http://localhost:11434"`
- `MODEL = "gemma4:e4b"`

**Functions:**

`chat(messages: list[dict], tools: list[dict] | None = None, stream: bool = True) -> generator | dict`

- POST to `/api/chat` with `model`, `messages`, `tools`, `stream`
- When `stream=True`: yields content chunks as they arrive (for real-time terminal output)
- When a tool call is returned: yields/returns the full response with `tool_calls` field
- Raises on connection error with a clear message ("Is Ollama running? Try: ollama serve")

`is_available() -> bool`

- GET `/api/tags` — returns True if Ollama is reachable and gemma4:e4b is pulled

**Message format (Ollama-native):**
```python
{"role": "system", "content": "..."}
{"role": "user", "content": "..."}
{"role": "assistant", "content": "...", "tool_calls": [...]}
{"role": "tool", "content": "...", "name": "tool_name"}
```

**Tool schema format (OpenAI-compatible, as Ollama expects):**
```python
{
    "type": "function",
    "function": {
        "name": "read_file",
        "description": "Read the contents of a file at the given path",
        "parameters": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Absolute or relative file path"}
            },
            "required": ["path"]
        }
    }
}
```

### 2. Tool System (`tools.py`)

Each tool is defined as a Python function plus its JSON Schema for Ollama. A registry dict maps tool names to their function + schema.

**`read_file(path: str) -> str`**
- Reads any file at the given path, no restrictions
- Supports: plain text, markdown, code, CSV, DOCX (via zipfile+xml), PDF (basic byte extraction), .pages (via textutil)
- Output capped at 8,000 characters
- Returns file content or error message

**`write_file(path: str, content: str) -> str`**
- Write permissions logic:
  - New file under `~/Projects/`: write without confirmation
  - New file outside `~/Projects/`: ask confirmation (unless `--yolo`)
  - Overwriting existing file anywhere: ask confirmation (unless `--yolo`)
- Confirmation prompt: `"Overwrite {path}? [y/N] "` / `"Write to {path} (outside ~/Projects)? [y/N] "`
- Creates parent directories as needed (`os.makedirs`)
- Returns success message with path, or "Cancelled" if user declines

**`list_files(directory: str) -> str`**
- Lists contents of the given directory
- Shows type indicator: `[dir]` or `[file]` with human-readable size
- Depth: 1 level only
- Cap: 50 entries, sorted alphabetically (dirs first)
- Returns formatted listing or error message

**`TOOL_REGISTRY`**: dict mapping name → `{"function": callable, "schema": dict}`

**`get_tool_schemas() -> list[dict]`**: returns list of all tool schemas for Ollama

**`execute_tool(name: str, args: dict, yolo: bool = False) -> str`**: looks up and calls the tool, returns result string

### 3. CLI & Agentic Loop (`kai.py`)

#### CLI Arguments

```
kai "your prompt"                     # Standard chat, streaming, no tools
kai "your prompt" --tools             # Agentic mode with tool calling
kai "your prompt" -f file.py          # Inject file(s) into context
kai "your prompt" --yolo              # Skip all write confirmations
kai "your prompt" --use-memory        # Inject relevant memories
kai --remember                        # Distill session into memory note
kai --list-memories                   # List saved memories
kai --logs [N]                        # Show last N query logs
kai --rate 1-5                        # Rate most recent query
kai --new-session                     # Start fresh session file
kai --system "custom prompt"          # Prepend custom system prompt
kai --debug                           # Verbose: show raw API responses
```

#### Standard Mode (no `--tools`)

1. Build messages: system prompt + optional memories + user message (with injected files)
2. Call `ollama.chat(messages, stream=True)` with no tools
3. Stream tokens to stdout in real time
4. Log the query + response

#### Agentic Tool Mode (`--tools`)

```
messages = [system, user_message]
for round in range(MAX_ROUNDS):  # MAX_ROUNDS = 10
    response = ollama.chat(messages, tools=get_tool_schemas(), stream=False)
    if response has tool_calls:
        for tool_call in response.tool_calls:
            result = execute_tool(tool_call.name, tool_call.args, yolo=yolo)
            messages.append(assistant_message_with_tool_call)
            messages.append(tool_result_message)
        continue
    else:
        # Final text response — stream it
        print(response.content)
        break
```

Key differences from v1:
- No text parsing for tool calls — Ollama returns structured `tool_calls`
- Full conversation history preserved across rounds (not reset after each tool call)
- 10 rounds max (up from 3) since tool calls are reliable
- Final response is the first non-tool-call response

#### System Prompt

```
You are kai. Be concise and direct.
You have tools available — use them when needed, never ask permission.
When writing files, include the complete content.
```

#### Sessions

- Same as v1: markdown files in `sessions/`, `session_YYYYMMDD_HHMMSS.md`
- Each turn appended as `## USER\n...\n## ASSISTANT\n...`
- `--new-session` creates a new file
- Latest session picked by sorted glob

#### Memories

- Same as v1: markdown files in `memories/`
- `--remember`: feeds full session to model, asks for distilled `TITLE / SUMMARY / FACTS`
- `--use-memory`: keyword-scored search, top-3 injected into prompt in `[MEMORY]...[/MEMORY]` block
- Cap 2,000 chars per memory in prompt

#### Logging

- Same as v1: JSON files in `logs/`, one per query
- Fields: `timestamp`, `prompt`, `output`, `mode` (standard/tools), `tool_calls`, `files`, `rating`
- `--logs N` prints last N entries
- `--rate 1-5` updates rating on most recent log

---

## Write Permission Rules

| Scenario | `--yolo` off | `--yolo` on |
|---|---|---|
| New file under `~/Projects/` | Write | Write |
| New file outside `~/Projects/` | Ask | Write |
| Overwrite file anywhere | Ask | Write |
| Read file anywhere | Read | Read |

---

## Migration

From `~/Projects/deepseek-r1-0528-qwen3-8b/` to `~/Projects/kai/`:

1. Rename directory
2. Copy `sessions/`, `memories/`, `logs/` as-is
3. Delete: `cache/` (GGUF weights — Ollama manages models), `inputs/` (test artifacts), `local_ds.py`, `__pycache__/`
4. Create: `kai.py`, `ollama.py`, `tools.py`
5. Update any shell alias/symlink from `local_ds.py` → `kai.py`

## Prerequisites

- macOS with Apple Silicon (M1 Pro confirmed)
- Ollama installed: `brew install ollama`
- Model pulled: `ollama pull gemma4:e4b`
- Python 3.10+ (stdlib only, no pip dependencies — uses `urllib.request` instead of `requests`)
- `kai` alias: `alias kai='python3 ~/Projects/kai/kai.py'`

## Dependencies

Zero third-party Python packages. All HTTP via `urllib.request`, all JSON via `json`, all file ops via `os`/`pathlib`/`zipfile`/`csv`/`xml.etree`. Same stdlib-only philosophy as v1.
