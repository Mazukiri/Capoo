# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Run the bot (node index.js)
npm install        # Install dependencies
```

No build step, no tests. The bot runs directly with Node.js 20.

## Environment

Copy `.env.example` to `.env` and set:
```
DISCORD_TOKEN=your_bot_token_here
```

Optionally `CAPOO_VERSION=v1` to serve the old image set. For cloud deployment, also set `PORT=10000`.

## Architecture

Everything lives in a single file: `index.js`. There are no modules or subdirectories beyond assets.

### Emoji registry (`gifs` object)

On startup, `index.js` builds an in-memory `gifs` map of `name → { path, attachmentName }` from two sources, loaded in this order:

1. `./png/<VERSION>/` — static PNG files (non-animated; usable without Nitro)
2. `./gif/<VERSION>/` — animated GIF files; these are what actually get sent

`VERSION` comes from the `CAPOO_VERSION` env var and defaults to `v2`. It is deliberately **not** named `VERSION` — the Koyeb service still has a stale `VERSION=v1` set in its dashboard that would override the default. The PNG of a
matching name only supplies the lookup key; the GIF supplies the bytes.

File names follow the pattern `<id>-<emojiname>.png/gif`. The leading `<id>-` is stripped and the extension removed to form the key (e.g., `1568-bugcat94.gif` → key `bugcat94`). GIFs take precedence over PNGs since they're loaded second.

`gifs.json` is **not used at runtime** — it's a reference catalog of external GIF URLs, not loaded by the bot. All serving is done via local files.

### How the bot works

The bot has two features, both send emoji as webhook messages to impersonate the triggering user:

1. **`/capoo` slash command** — autocomplete-enabled command letting users pick an emoji by name. The bot defers the reply ephemerally, sends via webhook, then deletes the ephemeral reply.

2. **Auto-replacement on `messageCreate`** — regex matches `:name:` text syntax and `<:name:id>` Discord emoji syntax. On a hit, the bot deletes the original message and resends it as a webhook with the GIF attached.

**Fuzzy matching**: both paths strip `[-_]` from emoji names before comparing, since Discord sometimes converts `-` to `_` in emoji names.

### IPv4 DNS patch

The top of `index.js` monkey-patches `dns.lookup` to always force `family: 4`. This is required to maintain a stable WebSocket connection on Koyeb's free tier, which has broken IPv6. **Do not remove this patch.**

### Express health-check server

An Express server listens on `PORT` (default `10000`) and responds to `GET /` with `"Bot is ALIVE!"`. This satisfies cloud provider health checks. It has no other routes.

### Discord.js version pin

`discord.js` is pinned to `14.11.0` (not latest). Newer versions use `undici` internals that cause IPv6 connection failures in the target hosting environment. Keep this pin when updating dependencies.

## Adding new emojis

- **Local file**: drop the file in `./gif/<VERSION>/` (animated) and `./png/<VERSION>/` (static) under the same `<id>-<name>` stem. For `v2` the lookup key is the full PNG stem, e.g. `002-capoo-relax`.
- **Server emoji**: `npm run sync-emojis -- --dry` then `npm run sync-emojis` uploads the PNGs as static server emojis on every guild the bot is in, diffing by name so only changes cost requests. See `scripts/README.md`. Uploading is optional — the bot also matches `:name:` typed as plain text.
- **Slash command autocomplete limit**: Discord limits autocomplete responses to 25 items. The autocomplete handler already slices to 25 (`filtered.slice(0, 25)`), so users must type enough to narrow the list.
