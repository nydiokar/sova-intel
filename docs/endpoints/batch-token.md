---
id: batch-token
sidebar_position: 2
---

# Holder Profiles & Similarity

Deep behavioral analysis across token holders and wallet groups.

---

## Token Holder Profiles

Returns behavioral profiles for the top N holders of any token — trader type, hold time, exit pattern, PnL, and a full distribution breakdown across the holder base. Useful for understanding who actually holds a token and how they trade it.

<p class="request-credits">Request credits: <span class="credits-value">20</span></p>

<div class="endpoint-header">
  <span class="method method-post">POST</span>
  <span class="endpoint-path">/intel/token/:mint/holders</span>
</div>

### Request Body

| Field | Type | Default | Description |
|:------|:-----|:--------|:------------|
| `topN` | integer | `20` | Number of top holders to analyze (1–100) |

### Response — 202

```json
{
  "status": "queued",
  "jobId": "intel-holders-abc123",
  "requestId": "intel-holders-1234-abc",
  "monitoringUrl": "/api/v1/jobs/intel-holders-abc123"
}
```

Poll `GET /jobs/{jobId}` until `status: completed`, then fetch the result.

### Result shape

Each profile in the `profiles` array contains:

```json
{
  "mode": "token",
  "tokenMint": "So11111111111111111111111111111111111111112",
  "profiles": [
    {
      "walletAddress": "ADDR_1",
      "rank": 1,
      "supplyPercent": 3.2,
      "behaviorType": "SWING_TRADER",
      "exitPattern": "partial_exit",
      "medianHoldTimeHours": 18.0,
      "avgHoldTimeHours": 22.1,
      "dailyFlipRatio": 0.04,
      "dataQualityTier": "GOLD",
      "confidence": 0.91,
      "completedCycleCount": 47,
      "tokenHoldingValueSol": 12.4,
      "walletRealizedPnlSol": 84.2,
      "walletPnlSol": 91.5,
      "exitRate": 0.72,
      "totalTokensTraded": 134,
      "knownType": null,
      "knownLabel": null,
      "analysisSkipped": false
    }
  ],
  "metadata": {
    "totalHoldersRequested": 20,
    "totalHoldersAnalyzed": 18,
    "totalProcessingTimeMs": 12400,
    "avgProcessingTimePerWalletMs": 689,
    "failedHolders": 2
  }
}
```

**Key profile fields:**

| Field | Description |
|:------|:------------|
| `behaviorType` | `SNIPER` `SCALPER` `MOMENTUM` `INTRADAY` `DAY_TRADER` `SWING` `POSITION` `HODLER` — or `null` |
| `exitPattern` | `partial_exit` or `all_at_once` |
| `dailyFlipRatio` | Share of positions held under 5 minutes |
| `dataQualityTier` | `GOLD` `SILVER` `BRONZE` `INSUFFICIENT` |
| `confidence` | Analysis confidence score (0–1) |
| `walletRealizedPnlSol` | Wallet's all-time realized PnL in SOL |
| `analysisSkipped` | `true` for known system wallets (burn, LP, etc.) — `knownLabel` explains why |

**Note:** `behaviorType: null` means fewer than 2 completed exits — not an error. The wallet is a current or fresh holder that hasn't sold enough to classify. Check `completedCycleCount`. See [Behavior Reference](/reference) for all thresholds.

:::note Result key
Use the **`jobId`** (not `requestId`) in the result key. Result keys expire after **15 minutes**.
```
GET /jobs/result/by-key?key=holder-profiles:result:{jobId}
```
:::

<div class="example-label">Example request</div>

```bash
curl -X POST https://api.sova-intel.com/api/v1/intel/token/TOKEN_MINT/holders \
  -H "X-Api-Key: ak_your_key" \
  -H "Content-Type: application/json" \
  -d '{"topN": 20}'
```

---

## Wallet Similarity Analysis

Detects behavioral overlap and coordinated trading patterns across 2–30 wallets. Returns pairwise similarity scores (token overlap + capital-weighted), global metrics, and detected clusters. Useful for identifying insider groups, coordinated wallets, or shared strategies.

<p class="request-credits">Request credits: <span class="credits-value">20</span></p>

<div class="endpoint-header">
  <span class="method method-post">POST</span>
  <span class="endpoint-path">/intel/wallets/similarity</span>
</div>

### Request Body

| Field | Type | Required | Description |
|:------|:-----|:--------:|:------------|
| `wallets` | string[] | ✓ | 2–30 Solana wallet addresses |

### Response — 202

```json
{
  "status": "queued",
  "jobId": "intel-similarity-abc123",
  "requestId": "intel-similarity-1234-xyz",
  "monitoringUrl": "/api/v1/jobs/intel-similarity-abc123"
}
```

Poll `GET /jobs/{jobId}` until `status: completed`, then fetch the result.

### Result shape

```json
{
  "vectorTypeUsed": "combined",
  "globalMetrics": {
    "averageSimilarity": 0.73,
    "mostSimilarPairs": [
      {
        "walletA": "ADDR_1",
        "walletB": "ADDR_2",
        "similarityScore": 0.91,
        "sharedTokenCount": 14
      }
    ]
  },
  "pairwiseSimilarities": [
    {
      "walletA": "ADDR_1",
      "walletB": "ADDR_2",
      "binaryScore": 0.91,
      "capitalScore": 0.87,
      "sharedTokens": [{ "mint": "TOKEN_MINT" }],
      "binarySharedTokenCount": 14,
      "capitalSharedTokenCount": 11
    }
  ],
  "uniqueTokensPerWallet": {
    "ADDR_1": { "binary": 22, "capital": 18 }
  },
  "walletLabels": {
    "ADDR_1": { "knownType": null, "knownLabel": null }
  }
}
```

| Field | Description |
|:------|:------------|
| `binaryScore` | Jaccard overlap — what fraction of tokens are shared |
| `capitalScore` | Capital-weighted overlap — accounts for position sizing |
| `globalMetrics.averageSimilarity` | Mean similarity across all pairs |

:::note Result key
Use the **`requestId`** (not `jobId`) in the similarity result key. Result keys expire after **15 minutes**.
```
GET /jobs/result/by-key?key=similarity:result:{requestId}
```
:::

<div class="example-label">Example request</div>

```bash
curl -X POST https://api.sova-intel.com/api/v1/intel/wallets/similarity \
  -H "X-Api-Key: ak_your_key" \
  -H "Content-Type: application/json" \
  -d '{"wallets": ["ADDR_1", "ADDR_2", "ADDR_3"]}'
```

---

## Bundled Deep Analysis

Holder profiles + similarity in a single call at a discount. The server discovers holder addresses itself — no need to supply them upfront. The processor chains the similarity job automatically once holder-profiles completes.

**35cr** vs 40cr for the two-step manual flow.

<p class="request-credits">Request credits: <span class="credits-value">35</span></p>

<div class="endpoint-header">
  <span class="method method-post">POST</span>
  <span class="endpoint-path">/intel/token/:mint/holders/deep</span>
</div>

### Request Body

| Field | Type | Default | Description |
|:------|:-----|:--------|:------------|
| `topN` | integer | `20` | Number of top holders to analyze (1–50) |

### Response — 202

Both job descriptors are returned immediately. `similarity.jobId` is `null` — the similarity job is queued by the processor internally after holder-profiles completes.

```json
{
  "status": "queued",
  "tokenMint": "So11111111111111111111111111111111111111112",
  "topN": 20,
  "holderProfiles": {
    "jobId": "hp-job-abc123",
    "requestId": "intel-holders-deep-1234-abc",
    "monitoringUrl": "/api/v1/jobs/hp-job-abc123"
  },
  "similarity": {
    "jobId": null,
    "requestId": "intel-holders-deep-sim-1234-xyz",
    "resultKey": "similarity:result:intel-holders-deep-sim-1234-xyz",
    "message": "Similarity job will be queued automatically after holder-profiles completes. Poll resultKey for result."
  },
  "message": "Bundled holder-profiles + similarity queued. Poll holderProfiles.monitoringUrl until completed, then poll similarity.resultKey."
}
```

### Polling strategy

```
1. Poll GET /jobs/{holderProfiles.jobId} until status: completed
   → processor discovers holder addresses and auto-queues similarity

2. Poll GET /jobs/result/by-key?key={similarity.resultKey}
   → 404 while similarity is still running
   → 200 with SimilarityResult when done
```

:::note Result keys
- Holder profiles result: `holder-profiles:result:{holderProfiles.jobId}` (key by **jobId**)
- Similarity result: `{similarity.resultKey}` as returned in the response (key by **requestId**)

Both expire after **15 minutes**.
:::

<div class="example-label">Example request</div>

```bash
curl -X POST https://api.sova-intel.com/api/v1/intel/token/TOKEN_MINT/holders/deep \
  -H "X-Api-Key: ak_your_key" \
  -H "Content-Type: application/json" \
  -d '{"topN": 20}'
```
