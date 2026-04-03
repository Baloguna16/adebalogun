# OpenAI Codex CLI on Raspberry Pi: A Comprehensive Research Brief

**Date:** 2026-03-15
**Classification:** General Research

---

## Executive Summary

OpenAI Codex CLI is a lightweight, open-source (Apache-2.0) coding agent built in Rust that runs in your terminal. It has **full ARM64 (aarch64) support**, meaning it runs on Raspberry Pi 3/4/5 with a 64-bit OS out of the box — either via a pre-built binary or `npm install`.

The main challenge you'll face isn't installation — it's **authentication over SSH**. Codex's default login flow opens a browser, which doesn't work in a headless session. There are three reliable workarounds: piping an API key via stdin, using the device-code OAuth flow, or configuring a custom model provider in `config.toml` that reads `OPENAI_API_KEY` from the environment.

The sandbox system (Landlock + seccomp) requires kernel 5.13+, which means you need **Raspberry Pi OS Bookworm** (kernel 6.1+). Older Bullseye installs (kernel 5.10) will have sandbox issues. On low-RAM Pis (1-2GB), you may need to disable the sandbox with `--sandbox danger-full-access`.

**Bottom line:** This works well on a Pi 4/5 with 64-bit Bookworm. The SSH auth setup takes one command.

---

## Background & Context

Codex CLI launched in 2025 as OpenAI's answer to terminal-based AI coding assistants. It's written in Rust (95% of the codebase), compiles to native binaries, and ships pre-built artifacts for macOS, Windows, and Linux on both x86_64 and aarch64. It currently has ~65,000 GitHub stars and is at version `0.114.0`.

Unlike OpenAI's desktop Codex app (which lists "Linux coming soon"), the CLI already works fully on Linux, including ARM. There is no official Raspberry Pi guide from OpenAI, but [ARM's own learning paths](https://learn.arm.com/install-guides/codex-cli/) have a guide for installing Codex CLI on ARM Linux.

---

## Installation on Raspberry Pi

### Prerequisites

| Requirement | Details |
|---|---|
| **Pi Model** | Pi 3, 4, or 5 (Pi Zero/1 are NOT supported — ARMv6) |
| **OS** | 64-bit Raspberry Pi OS Bookworm (aarch64, kernel 6.1+) |
| **RAM** | 4GB recommended; 1-2GB may have issues |
| **Internet** | Required (API calls to OpenAI servers) |

Check your architecture first:
```bash
uname -m    # Must show "aarch64", not "armv7l"
uname -r    # Should be 6.1+ for full sandbox support
```

### Option A: Direct Binary (Recommended — No Node.js Needed)

```bash
curl -L https://github.com/openai/codex/releases/latest/download/codex-aarch64-unknown-linux-musl.tar.gz | tar xz
sudo mv codex-aarch64-unknown-linux-musl /usr/local/bin/codex
codex --version
```

The `musl` build is statically linked — no glibc dependency concerns.

### Option B: Via npm

```bash
# Install Node.js 22 if not present
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt-get install -y nodejs

# Install Codex
npm install -g @openai/codex
```

---

## Authentication Over SSH

This is where the friction lives. Codex's default `codex login` tries to open a browser on `localhost:1455` for OAuth — which fails over SSH. Here are three approaches, from simplest to most flexible:

### Method 1: Pipe API Key via Stdin (Simplest)

Get an API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys), then:

```bash
export OPENAI_API_KEY="sk-proj-..."
printenv OPENAI_API_KEY | codex login --with-api-key
```

Verify it worked:
```bash
codex login status   # exit code 0 = authenticated
```

Credentials are saved to `~/.codex/auth.json`.

**Requirement:** An OpenAI API account with credits. This is separate from a ChatGPT subscription.

### Method 2: Device Code Auth (Uses ChatGPT Account)

```bash
codex login --device-auth
```

This prints a URL and a code. Open the URL on any device (your phone, laptop), enter the code, and authorize. Works with ChatGPT Plus/Pro/Team/Edu/Enterprise accounts.

**Caveat:** If your workspace admin has disabled device code auth, this will fail silently.

### Method 3: Config-Based Auth (No Login Command Needed)

Skip `codex login` entirely by creating a custom model provider that reads the API key from the environment:

```bash
mkdir -p ~/.codex
cat > ~/.codex/config.toml << 'TOML'
model_provider = "openai-api"

[model_providers.openai-api]
name = "OpenAI (API key from env)"
base_url = "https://api.openai.com/v1"
wire_api = "responses"
env_key = "OPENAI_API_KEY"
requires_openai_auth = false
TOML
```

Then add to your shell profile (`~/.bashrc` or `~/.zshrc`):
```bash
export OPENAI_API_KEY="sk-proj-..."
```

**Why this is needed:** The built-in `openai` provider has environment variable support explicitly disabled — it ignores `OPENAI_API_KEY` even if set. The custom provider config is the workaround. ([Source: OpenAI Community](https://community.openai.com/t/login-with-openai-api-key-environment-variable/1371740))

### Method 4: SSH Port Forwarding (Uses Browser OAuth)

If you specifically want ChatGPT OAuth (not an API key):

```bash
# From your local machine (the one with a browser):
ssh -L 1455:127.0.0.1:1455 user@raspberrypi

# Then on the Pi:
codex login
# Complete OAuth in your local browser — the callback hits localhost:1455 which is forwarded
```

---

## Sandbox Considerations on Raspberry Pi

Codex uses two sandbox layers on Linux:

| Layer | Mechanism | Kernel Requirement |
|---|---|---|
| Primary | Landlock + seccomp | 5.13+ |
| Optional | Bubblewrap (bwrap) | User namespaces enabled |

### Sandbox Modes

| Mode | Flag | Behavior |
|---|---|---|
| `read-only` | `--sandbox read-only` | Cannot write any files |
| `workspace-write` | `--sandbox workspace-write` | Can write to project dir + /tmp (default) |
| `danger-full-access` | `--sandbox danger-full-access` | No restrictions |

### Pi-Specific Issues

1. **Kernel version:** Bookworm ships kernel 6.1+ (good). Bullseye ships 5.10 (Landlock won't work — upgrade your OS).

2. **AppArmor restrictions:** Newer Debian-based systems may block unprivileged user namespaces, causing bwrap errors like `bwrap: loopback: Failed RTM_NEWADDR: Operation not permitted`. Fix:
   ```bash
   sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0
   ```

3. **Low RAM (1-2GB):** The sandbox adds overhead. If you hit memory issues, use `--sandbox danger-full-access` to skip it. Only do this if you trust the commands Codex runs.

---

## Risks & Gotchas

- **32-bit OS = no go.** If `uname -m` shows `armv7l`, you're on 32-bit. Flash 64-bit Raspberry Pi OS.
- **`OPENAI_API_KEY` is silently ignored** by the default provider. You must either `codex login --with-api-key` or set up the custom config.toml provider. This trips up almost everyone.
- **ChatGPT Teams conflict:** If you have an active ChatGPT Teams login, switching to API key auth may require `codex logout` first ([GitHub #2733](https://github.com/openai/codex/issues/2733)).
- **`--full-auto` forces `workspace-write`** and overrides any `--sandbox` flag you pass alongside it.
- **Pi-Apps lists a "Codex" app** that is a text editor, not OpenAI Codex CLI. Don't install that.

---

## The One-Liner

SSH into your Pi, then run this to install + authenticate in one shot:

```bash
# Install binary + authenticate with API key
curl -L https://github.com/openai/codex/releases/latest/download/codex-aarch64-unknown-linux-musl.tar.gz | tar xz \
  && sudo mv codex-aarch64-unknown-linux-musl /usr/local/bin/codex \
  && export OPENAI_API_KEY="sk-proj-YOUR_KEY_HERE" \
  && printenv OPENAI_API_KEY | codex login --with-api-key \
  && codex login status
```

Or if you prefer device-code auth (no API key needed, uses your ChatGPT account):

```bash
curl -L https://github.com/openai/codex/releases/latest/download/codex-aarch64-unknown-linux-musl.tar.gz | tar xz \
  && sudo mv codex-aarch64-unknown-linux-musl /usr/local/bin/codex \
  && codex login --device-auth
```

---

## Key Takeaways

1. **Codex CLI works on Raspberry Pi 3/4/5** with 64-bit OS — pre-built ARM64 binaries ship with every release.
2. **Use the musl static binary** for the cleanest install — no Node.js or runtime dependencies needed.
3. **For SSH auth, pipe your API key:** `printenv OPENAI_API_KEY | codex login --with-api-key`
4. **`OPENAI_API_KEY` env var is silently ignored** by the default provider — you must explicitly login or create a custom provider in `~/.codex/config.toml`.
5. **Run 64-bit Bookworm** (kernel 6.1+) to get full Landlock sandbox support.
6. **On low-RAM Pis**, use `--sandbox danger-full-access` if you hit memory issues with the sandbox.
7. **Device code auth** (`codex login --device-auth`) is the best option if you have a ChatGPT subscription but no API key.

---

## Sources & Further Reading

**Primary Sources:**
- [GitHub — openai/codex](https://github.com/openai/codex)
- [OpenAI Codex CLI Docs](https://developers.openai.com/codex/cli/)
- [OpenAI Codex Auth Docs](https://developers.openai.com/codex/auth/)
- [OpenAI Codex Config Reference](https://developers.openai.com/codex/config-reference/)
- [OpenAI Codex Sandboxing](https://developers.openai.com/codex/concepts/sandboxing/)
- [OpenAI Codex CLI Reference (flags)](https://developers.openai.com/codex/cli/reference)

**Expert Analysis & Guides:**
- [ARM Learning Paths — Codex CLI Install Guide](https://learn.arm.com/install-guides/codex-cli/)
- [SmartScope — Codex CLI Comprehensive Guide (2026)](https://smartscope.blog/en/generative-ai/chatgpt/openai-codex-cli-comprehensive-guide/)
- [Vincent Schmalbach — How Codex CLI Flags Work](https://www.vincentschmalbach.com/how-codex-cli-flags-actually-work-full-auto-sandbox-and-bypass/)

**Troubleshooting:**
- [GitHub #3820 — Headless Auth Feature Request](https://github.com/openai/codex/issues/3820)
- [GitHub #2798 — Remote/Headless OAuth](https://github.com/openai/codex/issues/2798)
- [GitHub #12572 — bwrap fails on Ubuntu 24.04](https://github.com/openai/codex/issues/12572)
- [OpenAI Community — API Key Env Var Discussion](https://community.openai.com/t/login-with-openai-api-key-environment-variable/1371740)
