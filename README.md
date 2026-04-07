<div align="center">
  <h1>Sova Intel</h1>
  <p><strong>On-chain trader intelligence for Solana.</strong></p>
  <p>
    <a href="https://docs.sova-intel.com">Docs</a> ·
    <a href="https://sova-intel.com">Dashboard</a> ·
    <a href="https://www.npmjs.com/package/@sova-intel/sdk"><img alt="npm sdk" src="https://img.shields.io/npm/v/@sova-intel/sdk.svg?style=flat-square&labelColor=000&color=blueviolet&label=sdk" /></a>
    &nbsp;
    <a href="https://www.npmjs.com/package/@sova-intel/mcp"><img alt="npm mcp" src="https://img.shields.io/npm/v/@sova-intel/mcp.svg?style=flat-square&labelColor=000&color=blueviolet&label=mcp" /></a>
  </p>
  <br />
  <img src="./static/demo.gif" alt="Sova Intel — agentic capabilities demo" width="760" />
</div>

---

One API call. A complete picture of how any Solana wallet trades — behavior type, win rate, hold times, PnL, bot/whale flags, and data quality tier. No swap parsing, no heuristics to build yourself.

## What you can do

| | |
|---|---|
| **Wallet Intelligence** | Full trader profile, HUD signal, per-token PnL, batch scoring up to 30 wallets |
| **Holder Profiles** | Behavioral breakdown of top-N holders for any token — who they are and how likely they are to sell |
| **Wallet Similarity** | Detect coordinated wallets, insider groups, and shared strategies across 2–30 addresses |
| **Deep Token Analysis** | Holder profiles + coordination check in a single call |

---

## Quick start

Get an API key at [sova-intel.com](https://sova-intel.com) — bonus credits on sign-up. Then pick your path:

### MCP — ask in plain language, no code

Add to Claude, Cursor, or any MCP-compatible client and query wallets and token holders in natural language.

<video src="https://github.com/user-attachments/assets/0aebad17-b316-47a2-aa09-f7b690678197" controls width="760"></video>

**Claude Code** (one command):

```bash
claude mcp add sova-intel -e SOVA_API_KEY=ak_your_key -- npx -y @sova-intel/mcp
```

**Claude Desktop / Cursor** (`claude_desktop_config.json` or `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "sova-intel": {
      "command": "npx",
      "args": ["-y", "@sova-intel/mcp"],
      "env": { "SOVA_API_KEY": "ak_your_key" }
    }
  }
}
```

Then just ask:

```
What kind of trader is DNfuF1L62WWyW3pNakVkyGGFzVVhj4Yr52jSmdTyeBHm?
Who are the top holders of <mint> and are any of them coordinated?
```

→ [MCP docs](https://docs.sova-intel.com/mcp) · [`@sova-intel/mcp`](https://www.npmjs.com/package/@sova-intel/mcp) on npm

### SDK / API — integrate in code

```bash
npm install @sova-intel/sdk
```

```typescript
import { SovaIntelClient } from '@sova-intel/sdk';

const client = new SovaIntelClient({
  baseUrl: 'https://api.sova-intel.com/api/v1',
  auth: { kind: 'apikey', apiKey: 'ak_your_key' },
});

const hud = await client.getWalletHud('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
// { behaviorCode: 'W', winRate: 0.67, dataQualityTier: 'GOLD', ... }
```

Or call the REST API directly:

```bash
curl https://api.sova-intel.com/api/v1/intel/wallet/<address>/hud \
  -H "X-Api-Key: ak_your_key"
```

Zero dependencies. Fully typed. Async-aware with built-in job polling.

→ [API reference](https://docs.sova-intel.com) · [SDK docs](https://docs.sova-intel.com/sdk)

---

## Authentication

**API key** — sign up at [sova-intel.com](https://sova-intel.com), open the user menu → **API Keys** → **Generate**.

**X402** — no account needed. Any [x402-capable](https://x402.org) agent pays per call directly from a Solana USDC wallet. A machine-readable skill descriptor at [`sova-intel.com/skill.md`](https://www.sova-intel.com/skill.md) tells the agent exactly what to call.

## Contributing

Documentation lives in `docs/`. Each file maps to a page on [docs.sova-intel.com](https://docs.sova-intel.com). PRs for corrections, clarity improvements, and example additions are welcome.
