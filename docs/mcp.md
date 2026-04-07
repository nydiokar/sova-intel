---
id: mcp
sidebar_position: 7
---

# MCP Server

The `@sova-intel/mcp` package exposes the full Sova Intel API as an [MCP](https://modelcontextprotocol.io) server — plug it into Claude, Cursor, or any MCP-compatible client and query wallets and token holders in plain language, no code required.

**NPM** · [`@sova-intel/mcp`](https://www.npmjs.com/package/@sova-intel/mcp) &nbsp;|&nbsp; **GitHub** · [`nydiokar/sova-intel`](https://github.com/nydiokar/sova-intel)

---

## Quickstart

**1. Get an API key** at [sova-intel.com](https://sova-intel.com)

**2. Add the server to your client**

<details>
<summary>Claude Code (one command)</summary>

```bash
claude mcp add sova-intel -e SOVA_API_KEY=ak_your_key -- npx -y @sova-intel/mcp
```

Restart Claude Code and confirm `sova-intel` appears connected with `/mcp`.

</details>

<details>
<summary>Claude Desktop</summary>

Edit `claude_desktop_config.json`:
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`

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

</details>

<details>
<summary>Cursor</summary>

Create or edit `.cursor/mcp.json` in your project root:

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

</details>

**3. Ask your first question**

```
What kind of trader is DNfuF1L62WWyW3pNakVkyGGFzVVhj4Yr52jSmdTyeBHm?
```

```
Who are the top holders of J5DnHXXmKsXmCAeSvPRc5qR64ruYKcZHKwZijv9HnZgK
and what are their trading styles?
```

```
Do any of those holders look coordinated or like the same actor?
```

---

## No API key? Use X402 mode

Pay per call directly from a Solana USDC wallet — no account, no API key:

```json
{
  "mcpServers": {
    "sova-intel": {
      "command": "npx",
      "args": ["-y", "@sova-intel/mcp"],
      "env": {
        "SOLANA_PRIVATE_KEY": "your_base58_keypair"
      }
    }
  }
}
```

Requires USDC in that wallet. See [Authentication](/authentication) for the full X402 flow.

---

## Tools

| Tool | What it returns | Credits |
|------|----------------|---------|
| `wallet_hud` | Behavior type, win rate, hold time, data quality | 1 cr |
| `wallet_profile` | Full wallet intel — HUD + PnL + behavior + KOL identity | 5 cr |
| `wallet_token_pnl` | Per-token PnL breakdown, paginated and sortable | 3 cr |
| `batch_wallet_hud` | HUD signals for up to 30 wallets at once | 5 cr flat |
| `token_holder_profiles` | Behavioral profiles for a token's top N holders | 20 cr |
| `wallet_similarity` | Coordination / sybil score across 2–30 wallets | 20 cr |
| `deep_token_analysis` | Holder profiles + similarity bundled in one call | 35 cr |
| `job_status` | Check status of a queued async job | free |
| `job_wait` | Resume a queued job and retrieve the result | free |

`token_holder_profiles`, `wallet_similarity`, and `deep_token_analysis` queue analysis server-side. If results aren't ready within the poll window, the tool returns a `jobId` — the MCP automatically resumes via `job_wait`. **Credits are charged once regardless of poll rounds.**

### Resources

Always available without authentication:

| URI | Content |
|-----|---------|
| `sova://pricing` | Live credit costs fetched from the API |
| `sova://skill` | Full tool reference, agent-optimised |
| `sova://help/auth` | Auth setup guide (API key vs X402) |
| `sova://playbooks/token-analysis` | Decision tree for token analysis workflows |

---

## Auth modes

| Mode | How | When to use |
|------|-----|-------------|
| `apikey` | Set `SOVA_API_KEY=ak_...` | Recommended — API key from dashboard |
| `x402` | Set `SOLANA_PRIVATE_KEY=...` | No account; pays per call from USDC wallet |
| `limited` | Neither env var set | Resources-only; all paid tools blocked |

The server auto-detects the mode from environment variables. To force a specific mode set `SOVA_AUTH_MODE=apikey\|x402\|auto`.

---

## Async job flow

Heavy analysis tools (`token_holder_profiles`, `wallet_similarity`, `deep_token_analysis`) queue work server-side and may not finish within the poll window. The MCP handles this transparently:

```
agent calls token_holder_profiles
  └─ result arrives within 45s → returns completed result
  └─ result not ready          → returns queued envelope
       ├─ jobId
       ├─ agentResultKey
       └─ resumeTool: "job_wait"
            └─ agent calls job_wait(jobId, agentResultKey)
                 └─ polls until completed, returns final result
```

Credits are deducted when the job is accepted (202), not per poll. You will never be double-charged.

---

## Session transcript

Real Claude Code session: `wallet_hud` (live), `token_holder_profiles` (queued → `job_wait`), `wallet_similarity`.

### 1 — wallet_hud

```json
// input
{ "walletAddress": "DNfuF1L62WWyW3pNakVkyGGFzVVhj4Yr52jSmdTyeBHm" }

// output
{
  "ok": true,
  "tool": "wallet_hud",
  "mode": "completed",
  "summary": "D profile, win rate 30%, median hold 12.9h, data quality GOLD, whale.",
  "data": {
    "behaviorCode": "D",
    "behaviorCategory": "DAY_TRADER",
    "winRate": 0.2987,
    "medianHoldTimeHours": 12.876,
    "dataQualityTier": "GOLD",
    "isBot": false,
    "isWhale": true,
    "currentHoldingsSol": 777.22
  }
}
```

### 2 — token_holder_profiles → job_wait

```json
// input
{ "tokenMint": "J5DnHXXmKsXmCAeSvPRc5qR64ruYKcZHKwZijv9HnZgK", "topN": 10 }

// response: queued (analysis still running at 45s)
{
  "ok": true,
  "tool": "token_holder_profiles",
  "mode": "queued",
  "summary": "Analysis still running. Use job_wait to retrieve the result.",
  "job": {
    "jobId": "holder-profiles-J5DnHXXm...",
    "agentResultKey": "holder-profiles:agent:result:holder-profiles-J5DnHXXm...",
    "resumeTool": "job_wait"
  }
}

// agent calls job_wait → completed
{
  "ok": true,
  "tool": "job_wait",
  "mode": "completed",
  "data": {
    "aggregate": {
      "totalHolders": 10,
      "analyzedHolders": 9,
      "top5SupplyPct": 17.98,
      "behaviorDistribution": [
        { "behaviorType": "INTRADAY",   "count": 4, "supplyPct": 11.9 },
        { "behaviorType": "MOMENTUM",   "count": 2, "supplyPct": 6.6 },
        { "behaviorType": "SWING",      "count": 1, "supplyPct": 3.7 },
        { "behaviorType": "DAY_TRADER", "count": 1, "supplyPct": 3.4 },
        { "behaviorType": "SNIPER",     "count": 1, "supplyPct": 3.0 }
      ],
      "avgWalletPnlSol": -260.73
    }
  }
}
```

### 3 — wallet_similarity

```json
// output
{
  "ok": true,
  "tool": "wallet_similarity",
  "mode": "completed",
  "summary": "coordination score 0.28 (LOW), 9 wallets, 6 flagged pairs.",
  "data": {
    "coordinationScore": 0.277,
    "pairs": [
      {
        "walletA": "2jjgBEwQqhUXRPjSqGqwsWCkqgRsZ7MkT3kTeWJJ8e7Q",
        "walletB": "ACp9B94HaNELWmcf2941kUKMGz8AMQHEBJsM4s6UBEKN",
        "similarityScore": 0.82,
        "flag": "HIGH_SIMILARITY_AND_OVERLAP"
      }
    ],
    "metadata": { "walletsAnalyzed": 9, "flaggedPairs": 6 }
  }
}
```

---

## Configuration reference

All settings via environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `SOVA_API_KEY` | — | API key (`ak_...`) for apikey mode |
| `SOVA_AUTH_MODE` | `auto` | `apikey` \| `x402` \| `auto` |
| `SOLANA_PRIVATE_KEY` | — | Base58 keypair for X402 mode |
| `SOLANA_RPC_URL` | mainnet public | Custom Solana RPC endpoint |
| `SOVA_BASE_URL` | `https://api.sova-intel.com/api/v1` | API endpoint |
| `SOVA_POLL_INTERVAL_MS` | `5000` | Polling interval for async jobs |
| `SOVA_MAX_POLL_ATTEMPTS` | `9` | Max poll retries before returning queued envelope |
| `SOVA_WAIT_TIMEOUT_MS` | `45000` | Standard async timeout (max 45s) |
| `SOVA_DEEP_WAIT_TIMEOUT_MS` | `45000` | Deep analysis timeout (max 45s) |
