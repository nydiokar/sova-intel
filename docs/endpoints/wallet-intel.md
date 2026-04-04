---
id: wallet-intel
sidebar_position: 1
---

# Wallet Intelligence

Per-wallet intelligence endpoints. All require authentication.

---

## Full Wallet Profile

Complete behavioral analysis, realized/unrealized PnL, HUD signal, and summary metadata for a single wallet.

<p class="request-credits">Request credits: <span class="credits-value">5</span></p>

<div class="endpoint-header">
  <span class="method method-get">GET</span>
  <span class="endpoint-path">/intel/wallet/:addr</span>
</div>

### Parameters

| Name | In | Type | Required | Description |
|:-----|:---|:-----|:--------:|:------------|
| `wallet_address` | path | string | ✓ | Solana wallet address (base58) |
| `X-Prepaid-Job-Id` | header | string | — | Pass `prepaidJobId` from a 202 response to skip re-charging |

### Response — 200

```json
{
  "status": "ok",
  "walletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "summary": {
    "lastAnalyzedAt": "2026-03-03T11:30:00.000Z",
    "realizedPnl": 142.87,
    "profitableTradesCount": 34,
    "totalTradesCount": 51,
    "currentSolBalance": 4.21,
    "knownType": null,
    "knownLabel": null
  },
  "kol": {
    "name": "Ansem",
    "twitter": "https://x.com/blknoiz06",
    "telegram": null
  },
  "hud": {
    "behaviorCode": "SWING_TRADER",
    "winRate": 0.67,
    "trimmedMeanPnl": 12.4,
    "dataQualityTier": "GOLD",
    "isBot": false,
    "isWhale": false,
    "medianHoldTimeHours": 12.1,
    "calculatedAt": "2026-03-03T11:30:00.000Z"
  },
  "behavior": {
    "tradingStyle": "swing",
    "speedCategory": "medium",
    "avgHoldTimeHours": 18.4,
    "medianHoldTimeHours": 12.1,
    "buySellRatio": 0.98,
    "exitPattern": "partial_exit",
    "avgEntryMcapUsd": 182000,
    "typicalEntryMcapUsd": 145000,
    "entryMcapP25Usd": 72000,
    "entryMcapP75Usd": 310000,
    "dominantEntryMcapBucket": "100k_to_250k",
    "dominantEntryMcapBucketShare": 0.41
  },
  "pnl": {
    "allTime": {
      "realizedPnlSol": 142.87,
      "unrealizedPnlSol": 9.3,
      "netPnlSol": 152.17,
      "winRate": 0.67
    }
  }
}
```

| Field | Type | Description |
|:------|:-----|:------------|
| `kol` | object \| null | Present when this wallet belongs to a known Key Opinion Leader. `null` for regular wallets. |
| `kol.name` | string | Public name of the KOL |
| `kol.twitter` | string \| null | Twitter/X profile URL |
| `kol.telegram` | string \| null | Telegram profile or channel URL |
| `behavior` | object \| null | Trading behavior summary for the wallet |
| `behavior.tradingStyle` | string \| null | High-level style label such as `swing` |
| `behavior.speedCategory` | string \| null | Pace bucket for how quickly the wallet turns positions |
| `behavior.buySellRatio` | number \| null | Buy volume divided by sell volume across observed history |
| `behavior.exitPattern` | string \| null | Typical exit style, such as `partial_exit` |
| `behavior.avgEntryMcapUsd` | number \| null | Mean market cap at wallet entry across completed positions |
| `behavior.typicalEntryMcapUsd` | number \| null | Typical market cap at entry, after trimming outliers |
| `behavior.entryMcapP25Usd` | number \| null | 25th percentile of entry market caps |
| `behavior.entryMcapP75Usd` | number \| null | 75th percentile of entry market caps |
| `behavior.dominantEntryMcapBucket` | string \| null | Most common market-cap bucket the wallet enters in |
| `behavior.dominantEntryMcapBucketShare` | number \| null | Share of completed entries that fall in the dominant bucket |

:::note KOL wallets
KOL wallets are analyzed identically to any other trader — full PnL, behavior, and HUD data is available. The `kol` field is purely additive identity context.
:::

### Response — 202 (timeout fallback)

```json
{
  "status": "queued",
  "walletAddress": "7xKXtg...",
  "jobId": "intel-flash-abc123",
  "prepaidJobId": "intel-flash-abc123",
  "monitoringUrl": "/api/v1/jobs/intel-flash-abc123",
  "message": "Wallet analysis queued."
}
```

:::note Synchronous hold
For cold or stale wallets the server holds the HTTP connection open for up to 30 seconds while running a flash analysis. You receive a `200` directly in most cases.

On timeout the server returns `202` with a `prepaidJobId`. Poll until complete, then re-call with `X-Prepaid-Job-Id` header — **5cr total regardless of path**.
:::

<div class="example-label">Example request</div>

```bash
curl https://api.sova-intel.com/api/v1/intel/wallet/WALLET_ADDRESS \
  -H "X-Api-Key: ak_your_key"
```

---

## Wallet HUD Signal

The fastest, cheapest signal for a wallet — behavior code, win rate, PnL quality, bot and whale flags. Use this for bulk scoring before deciding whether to pull a full profile.

<p class="request-credits">Request credits: <span class="credits-value">1</span></p>

<div class="endpoint-header">
  <span class="method method-get">GET</span>
  <span class="endpoint-path">/intel/wallet/:addr/hud</span>
</div>

### Parameters

| Name | In | Type | Required | Description |
|:-----|:---|:-----|:--------:|:------------|
| `wallet_address` | path | string | ✓ | Solana wallet address (base58) |
| `X-Prepaid-Job-Id` | header | string | — | Pass `prepaidJobId` from a 202 response |

### Response — 200

```json
{
  "walletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "behaviorCode": "SWING_TRADER",
  "winRate": 0.67,
  "trimmedMeanPnl": 12.4,
  "avgTxValueSol": 2.45,
  "avgTradesPerDay": 4.2,
  "medianHoldTimeHours": 12.1,
  "uniqueTokensPerDay": 3.1,
  "currentHoldingsSol": 45.2,
  "dataQualityTier": "GOLD",
  "isBot": false,
  "isWhale": false,
  "calculatedAt": "2026-03-03T11:30:00.000Z"
}
```

### Data quality tiers

| Tier | Meaning |
|:-----|:--------|
| `GOLD` | High confidence — rich transaction history |
| `SILVER` | Good confidence — moderate history |
| `BRONZE` | Low confidence — limited history |
| `INSUFFICIENT` | Not enough data to score |

:::note Synchronous hold
Same 30s hold and `202` fallback contract as the full profile endpoint above.
:::

<div class="example-label">Example request</div>

```bash
curl https://api.sova-intel.com/api/v1/intel/wallet/WALLET_ADDRESS/hud \
  -H "X-Api-Key: ak_your_key"
```

---

## Per-Token PnL Breakdown

Paginated, sortable table of realized and unrealized PnL broken down by token. Useful for auditing which tokens drove a wallet's performance.

<p class="request-credits">Request credits: <span class="credits-value">3</span></p>

<div class="endpoint-header">
  <span class="method method-get">GET</span>
  <span class="endpoint-path">/intel/wallet/:addr/tokens</span>
</div>

### Query Parameters

| Name | Type | Default | Description |
|:-----|:-----|:--------|:------------|
| `page` | integer | `1` | Page number |
| `pageSize` | integer | `20` | Results per page (max 100) |
| `sortBy` | string | `netSolProfitLoss` | `netSolProfitLoss` \| `realizedPnlSol` \| `roi` \| `totalSolSpent` |
| `sortOrder` | string | `DESC` | `ASC` \| `DESC` |

### Response — 200

```json
{
  "data": [
    {
      "tokenAddress": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "realizedPnlSol": 28.4,
      "unrealizedPnlSol": 2.1,
      "roi": 1.85,
      "totalSolSpent": 40.2,
      "winRate": 0.72
    }
  ],
  "total": 84,
  "page": 1,
  "pageSize": 20
}
```

<div class="example-label">Example request</div>

```bash
curl "https://api.sova-intel.com/api/v1/intel/wallet/WALLET_ADDRESS/tokens?pageSize=50&sortBy=realizedPnlSol&sortOrder=DESC" \
  -H "X-Api-Key: ak_your_key"
```

---

## Batch Wallet Scoring

Score up to 30 wallets in a single call. Wallets without fresh data are automatically queued for flash analysis — no pre-analysis step needed.

<p class="request-credits">Request credits: <span class="credits-value">5</span> flat</p>

<div class="endpoint-header">
  <span class="method method-post">POST</span>
  <span class="endpoint-path">/intel/wallets/batch-hud</span>
</div>

### Request Body

| Field | Type | Required | Description |
|:------|:-----|:--------:|:------------|
| `wallets` | string[] | ✓ | 1–30 Solana wallet addresses |

### Response — 200

```json
{
  "huds": {
    "ADDR_1": {
      "walletAddress": "ADDR_1",
      "behaviorCode": "SWING_TRADER",
      "winRate": 0.67,
      "trimmedMeanPnl": 12.4,
      "dataQualityTier": "GOLD",
      "isBot": false,
      "isWhale": false,
      "calculatedAt": "2026-03-03T11:30:00.000Z"
    }
  },
  "queued": [
    {
      "walletAddress": "ADDR_2",
      "jobId": "intel-batch-abc123",
      "monitoringUrl": "/api/v1/jobs/intel-batch-abc123"
    }
  ],
  "skipped": ["ADDR_3"]
}
```

| Field | Description |
|:------|:------------|
| `huds` | Map of `address → WalletHud` for wallets with fresh data |
| `queued` | Wallets that had no data — flash analysis auto-queued, poll and re-call |
| `skipped` | Known system/program wallets — no analysis possible |

:::note
Call again after queued jobs complete to retrieve the remaining HUDs. Total charge is 5cr per call regardless of how many wallets are ready.
:::

<div class="example-label">Example request</div>

```bash
curl -X POST https://api.sova-intel.com/api/v1/intel/wallets/batch-hud \
  -H "X-Api-Key: ak_your_key" \
  -H "Content-Type: application/json" \
  -d '{"wallets": ["ADDR_1", "ADDR_2", "ADDR_3"]}'
```
