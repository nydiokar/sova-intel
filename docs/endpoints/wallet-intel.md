---
id: wallet-intel
sidebar_position: 1
---

# Wallet Intel

Three endpoints for per-wallet intelligence. All require authentication.

---

## GET /intel/wallet/:addr

**Full wallet profile — 5 credits ($0.075)**

Returns a complete intelligence profile: behavioral analysis, realized/unrealized PnL, HUD signal, and summary metadata.

```bash
curl https://api.sova-intel.com/api/v1/intel/wallet/WALLET_ADDRESS \
  -H "X-Api-Key: ak_your_key"
```

### Synchronous hold

For cold or stale wallets the server holds the HTTP connection open while running a flash analysis (up to ~30 seconds). In most cases you receive a `200` in the same call.

On timeout fallback the server returns `202` with a `prepaidJobId`. Poll the job then re-call with `X-Prepaid-Job-Id` — total charge is **5cr regardless of path**.

```
→ 200  Analysis ready (5cr charged)
→ 202  Timeout fallback (0cr) — poll job, re-call with X-Prepaid-Job-Id header
```

### Parameters

| Name | In | Type | Required | Description |
|:-----|:---|:-----|:--------:|:------------|
| `address` | path | string | ✓ | Solana wallet address (base58) |
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
    "exitPattern": "partial_exit"
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

Poll `GET /jobs/{jobId}` until `completed`, then re-call this endpoint with `X-Prepaid-Job-Id: {prepaidJobId}`.

---

## GET /intel/wallet/:addr/hud

**Wallet HUD signal — 1 credit ($0.015)**

Returns the compact signal: behavior code, win rate, PnL tier, bot/whale flags. The cheapest way to score a wallet.

```bash
curl https://api.sova-intel.com/api/v1/intel/wallet/WALLET_ADDRESS/hud \
  -H "X-Api-Key: ak_your_key"
```

Same synchronous hold and `202` fallback contract as the full profile endpoint above.

### Parameters

| Name | In | Type | Required | Description |
|:-----|:---|:-----|:--------:|:------------|
| `address` | path | string | ✓ | Solana wallet address (base58) |
| `X-Prepaid-Job-Id` | header | string | — | Pass `prepaidJobId` from a 202 response |

### Response — 200

```json
{
  "walletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "signalType": "wallet_behavior_v1",
  "behaviorCode": "SWING_TRADER",
  "behaviorCategory": "SWING_TRADER",
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

---

## GET /intel/wallet/:addr/tokens

**Per-token PnL table — 3 credits ($0.045)**

Returns a paginated, sortable table of realized/unrealized PnL broken down by token.

```bash
curl "https://api.sova-intel.com/api/v1/intel/wallet/WALLET_ADDRESS/tokens?pageSize=50&sortBy=realizedPnlSol&sortOrder=DESC" \
  -H "X-Api-Key: ak_your_key"
```

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
