---
id: introduction
slug: /
sidebar_position: 1
---

# Introduction

Everything you need to start using the Sova Intel API.

**Base URL**

```
https://api.sova-intel.com/api/v1
```

:::note
The API is in active development. All breaking changes are versioned.
:::

## What is Sova Intel?

Sova Intel turns raw Solana transaction history into actionable intelligence. Instead of parsing thousands of swaps yourself, you call one endpoint and get back:

- **Trader profiles** — behavior category, win rate, hold times, PnL, and trading speed derived from full transaction history
- **Wallet HUD** — a compact, single-call signal that tells you how a wallet trades: behavior type, win rate, bot/whale flags, and data quality tier
- **Token holder profiles** — behavioral breakdown of the top N holders of any token: who they are, how they trade, and how likely they are to sell
- **Wallet similarity** — detect coordinated wallets, insider groups, and shared strategies across 2–30 addresses

:::tip AI agents & LLM integrations
A machine-readable skill descriptor is served at [`https://www.sova-intel.com/skill.md`](https://www.sova-intel.com/skill.md).

Any agent that is already x402-capable — able to pay for services on-chain — can query this API with no additional setup. No API key, no registration. The skill tells it what to call, x402 handles payment, and it gets results. If your agent can pay for anything on the internet via x402, it can use Sova Intel out of the box.
:::

## Getting Started

### 1. Get an API key

You can create your own API key in the Sova Intel dashboard. Sign up or sign in, open the user menu in the top-right corner, click **API Keys**, enter a short description, and click **Generate**.

The raw key is shown exactly once, so copy it before leaving the page. API requests made with that key deduct credits from your account balance. If you do not want to use credits or a dashboard account, you can also use [X402 autonomous payment](/authentication#x402-autonomous-solana-usdc-payment) to pay per-call directly from a Solana wallet with no key required.

### 2. Make your first call

```bash
curl https://api.sova-intel.com/api/v1/intel/wallet/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU/hud \
  -H "X-Api-Key: ak_your_key"
```

Response:

```json
{
  "walletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "behaviorCode": "SWING_TRADER",
  "winRate": 0.67,
  "trimmedMeanPnl": 12.4,
  "dataQualityTier": "GOLD",
  "isBot": false,
  "isWhale": false,
  "calculatedAt": "2026-03-03T11:30:00.000Z"
}
```

### 3. Install the TypeScript SDK (optional)

```bash
npm install @sova-intel/sdk
```

See the [SDK Quickstart](/sdk) for full setup and examples.

## Endpoint Overview

| Category | Endpoints | Auth Required |
|:---------|:----------|:--------------|
| [Wallet Intelligence](/endpoints/wallet-intel) | Full profile, HUD signal, per-token PnL, batch scoring | Yes |
| [Holder Profiles & Similarity](/endpoints/batch-token) | Token holder profiles, wallet similarity | Yes |
| [Job Polling](/endpoints/async-jobs) | Job status polling, result fetch | Status: no — Result: yes |
| [Pricing](/pricing) | Credit costs and pack options | No |
| [skill.md](https://www.sova-intel.com/skill.md) | Machine-readable descriptor for x402-capable agents | No |
