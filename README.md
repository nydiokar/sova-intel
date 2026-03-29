<div align="center">
  <img src="./static/img/logo.svg" alt="Sova Intel" height="72" />
  <h1>Sova Intel</h1>
  <p><strong>On-chain trader intelligence for Solana.</strong></p>
  <p>
    <a href="https://docs.sova-intel.com">Documentation</a> ·
    <a href="https://sova-intel.com">Dashboard</a> ·
    <a href="https://www.npmjs.com/package/@sova-intel/sdk"><img alt="npm" src="https://img.shields.io/npm/v/@sova-intel/sdk.svg?style=flat-square&labelColor=000&color=blueviolet" /></a>
  </p>
</div>

---

<div align="center">
  <img src="./static/demo.gif" alt="Sova Intel agent demo" width="720" />
</div>

One API call. A complete picture of how any Solana wallet trades — behavior type, win rate, hold times, PnL, bot/whale flags, and data quality tier. No swap parsing, no heuristics you have to build yourself.

## What you can do

| | |
|---|---|
| **Wallet Intelligence** | Full trader profile, HUD signal, per-token PnL, batch scoring up to 30 wallets |
| **Holder Profiles** | Behavioral breakdown of top-N holders for any token — who holds it and how likely they are to sell |
| **Wallet Similarity** | Detect coordinated wallets, insider groups, and shared strategies across 2–30 addresses |
| **Bundled Deep Analysis** | Holder profiles + similarity in a single call |
| **Agent-Optimised Endpoints** | Compact result shapes purpose-built for LLM agents — aggregate-first, ~10× smaller payloads |

## Built for AI agents

Sova Intel has dedicated agent endpoints that return compact, pre-structured results designed to fit inside a tool call response without hitting token limits.

**`POST /intel/token/:mint/holders/agent`** — Same holder-profiles analysis, but the result leads with a population-level aggregate block (behavior distribution, supply concentration, average PnL) so an agent can make a buy/skip decision without scanning 20 individual profiles. `currentHoldings[]` is replaced with a 5-entry `holdingsSummary`. Target: ~1–2k tokens vs ~10k+ for the full shape.

**`POST /intel/wallets/similarity/agent`** — Same similarity analysis, but the result leads with a single `coordinationScore` (0–1). Only pairs with real signal are included; pairs that cross coordination thresholds get a `flag` (`HIGH_SIMILARITY`, `HIGH_OVERLAP`, or `HIGH_SIMILARITY_AND_OVERLAP`).

Both agent endpoints cost the same credits as their standard counterparts. The full developer result is also stored and accessible via `resultKey` in the same 202 response.

**x402 autonomous payment** — Any x402-capable agent can call the API with no API key or account. A machine-readable skill descriptor at [`sova-intel.com/skill.md`](https://www.sova-intel.com/skill.md) tells the agent exactly what to call — payment is automatic from a Solana wallet.

## Quick start

```bash
curl https://api.sova-intel.com/api/v1/intel/wallet/<address>/hud \
  -H "X-Api-Key: ak_your_key"
```

```json
{
  "walletAddress": "7xKXtg...",
  "behaviorCode": "SWING_TRADER",
  "winRate": 0.67,
  "trimmedMeanPnl": 12.4,
  "dataQualityTier": "GOLD",
  "isBot": false,
  "isWhale": false
}
```

Get an API key and bonus credits at [sova-intel.com](https://sova-intel.com). Full reference at [docs.sova-intel.com](https://docs.sova-intel.com).

## TypeScript SDK

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
```

Zero dependencies. Fully typed. Async-aware with built-in job polling. → [SDK docs](https://docs.sova-intel.com/sdk)

## Authentication

**API Key** — Credit-based. Sign up at [sova-intel.com](https://sova-intel.com), open the user menu, click **API Keys**. Bonus credits on sign-up.

**X402** — No account needed. Any [x402-capable](https://x402.org) agent pays per call directly from a Solana wallet. A machine-readable skill descriptor at [`sova-intel.com/skill.md`](https://www.sova-intel.com/skill.md) tells the agent exactly what to call — payment is automatic.

## Running the docs locally

```bash
npm install
npm start        # dev server at http://localhost:3000
npm run build    # production build → build/
```

Requires Node ≥ 20.

## Contributing

Documentation lives in `docs/`. Each file maps to a page on [docs.sova-intel.com](https://docs.sova-intel.com). PRs for corrections, clarity improvements, and example additions are welcome.

---

<div align="center">
  <sub>Built on <a href="https://docusaurus.io">Docusaurus</a> · API base: <code>https://api.sova-intel.com/api/v1</code></sub>
</div>
