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

- **Trader profiles** — behavior category, win rate, hold times, speed
- **Realized & unrealized PnL** — per wallet and per token
- **Holder maps** — top N holders of any token with behavioral profiles
- **Wallet similarity** — cluster analysis across 2–30 wallets

## Getting Started

### 1. Get an API key

Contact the Sova team to get an `ak_` prefixed API key, or use [X402 autonomous payment](/authentication#x402-autonomous-solana-usdc-payment) to pay per-call directly from a Solana wallet with no key required.

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
| [Wallet Intel](/endpoints/wallet-intel) | Profile, HUD, per-token PnL | Yes |
| [Batch & Token](/endpoints/batch-token) | Batch HUD, holder profiles, similarity | Yes |
| [Async Jobs](/endpoints/async-jobs) | Job status polling, result fetch | Status: no — Result: yes |
