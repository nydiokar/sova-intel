---
id: batch-token
sidebar_position: 2
---

# Holder Profiles & Similarity

Endpoints for batch wallet scoring and token holder analysis.

---

## POST /intel/wallets/batch-hud

**Batch HUD for up to 30 wallets — 5 credits flat ($0.075)**

Returns HUD signals for multiple wallets in a single call. 5 credits regardless of how many wallets have data.

Wallets without data in the database appear in `notFound`. Analyze them individually with [`GET /intel/wallet/:addr`](/endpoints/wallet-intel#get-intelwalletaddr) to populate them.

```bash
curl -X POST https://api.sova-intel.com/api/v1/intel/wallets/batch-hud \
  -H "X-Api-Key: ak_your_key" \
  -H "Content-Type: application/json" \
  -d '{"wallets": ["ADDR_1", "ADDR_2", "ADDR_3"]}'
```

### Request Body

```json
{
  "wallets": ["ADDR_1", "ADDR_2", "ADDR_3"]
}
```

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
  "notFound": ["ADDR_3"],
  "calculatedAt": "2026-03-03T11:30:00.000Z"
}
```

| Field | Description |
|:------|:------------|
| `huds` | Map of `walletAddress → WalletHud` for wallets with data |
| `notFound` | Addresses with no data in DB |
| `calculatedAt` | Timestamp of the batch response |

---

## POST /intel/token/:mint/holders

**Top N token holders with behavioral profiles — 20 credits ($0.30)**

Queues an async analysis of the top N holders of the given token. Returns HTTP `202` immediately — the job runs in the background.

```bash
curl -X POST https://api.sova-intel.com/api/v1/intel/token/TOKEN_MINT/holders \
  -H "X-Api-Key: ak_your_key" \
  -H "Content-Type: application/json" \
  -d '{"topN": 20}'
```

### Request Body

```json
{
  "topN": 20
}
```

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

### Retrieving results

Poll `GET /jobs/{jobId}` until `status: completed`, then fetch:

```bash
curl "https://api.sova-intel.com/api/v1/jobs/result/by-key?key=holder-profiles:result:intel-holders-abc123" \
  -H "X-Api-Key: ak_your_key"
```

:::note Result key
Use the **`jobId`** (not `requestId`) in the result key: `holder-profiles:result:{jobId}`
:::

Result keys expire after **15 minutes**.

### Result shape

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
      "dataQualityTier": "GOLD",
      "confidence": 0.91,
      "completedCycleCount": 47
    }
  ],
  "metadata": {
    "totalHoldersRequested": 20,
    "totalHoldersAnalyzed": 18,
    "totalProcessingTimeMs": 12400,
    "avgProcessingTimePerWalletMs": 689
  }
}
```

---

## POST /intel/wallets/similarity

**Wallet similarity analysis — 20 credits ($0.30)**

Identifies behavioral clusters and trading pattern overlap across 2–30 wallets. Useful for detecting coordinated wallets, insider groups, or shared strategies.

```bash
curl -X POST https://api.sova-intel.com/api/v1/intel/wallets/similarity \
  -H "X-Api-Key: ak_your_key" \
  -H "Content-Type: application/json" \
  -d '{"wallets": ["ADDR_1", "ADDR_2", "ADDR_3"]}'
```

### Request Body

```json
{
  "wallets": ["ADDR_1", "ADDR_2", "ADDR_3"]
}
```

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

### Retrieving results

Poll `GET /jobs/{jobId}` until `status: completed`, then fetch:

```bash
curl "https://api.sova-intel.com/api/v1/jobs/result/by-key?key=similarity:result:intel-similarity-1234-xyz" \
  -H "X-Api-Key: ak_your_key"
```

:::note Result key
Use the **`requestId`** (not `jobId`) in the similarity result key: `similarity:result:{requestId}`
:::

Result keys expire after **15 minutes**.

See the [Async Jobs](/endpoints/async-jobs) page for the full polling flow.
