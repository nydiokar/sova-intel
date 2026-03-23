---
id: sdk
sidebar_position: 5
---

# TypeScript SDK

The official TypeScript SDK — zero dependencies, works in Node 18+ and any modern runtime with native `fetch`.

## Installation

```bash
npm install @sova-intel/sdk
# or
pnpm add @sova-intel/sdk
```

## Setup

### API key

```typescript
import { SovaIntelClient } from "@sova-intel/sdk";

const client = new SovaIntelClient({
  baseUrl: "https://api.sova-intel.com/api/v1",
  auth: {
    kind: "apikey",
    apiKey: process.env.SOVA_API_KEY!,
  },
});
```

### X402 autonomous payment

```typescript
import { SovaIntelClient } from "@sova-intel/sdk";

const client = new SovaIntelClient({
  baseUrl: "https://api.sova-intel.com/api/v1",
  auth: {
    kind: "x402",
    buildPayment: async (payTo, amountBaseUnits) => {
      // build USDC transferChecked tx, return base64 payment header
      // see Authentication page for full implementation
    },
  },
});
```

## Examples

### Get a wallet HUD (1cr)

```typescript
const hud = await client.getWalletHud("7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU");

console.log(hud.behaviorCode);      // "SWING_TRADER"
console.log(hud.winRate);           // 0.67
console.log(hud.trimmedMeanPnl);    // 12.4
console.log(hud.dataQualityTier);   // "GOLD"
console.log(hud.isBot);             // false
```

The SDK handles cold wallet 202 fallback automatically — you always get back a `WalletHud`.

### Full wallet profile (5cr)

```typescript
const profile = await client.getWalletProfile("7xKXtg...");

console.log(profile.summary.realizedPnl);         // 142.87
console.log(profile.behavior?.tradingStyle);       // "swing"
console.log(profile.pnl?.allTime?.netPnlSol);     // 152.17

// KOL identity — present when the wallet belongs to a known trader
if (profile.kol) {
  console.log(profile.kol.name);     // "Ansem"
  console.log(profile.kol.twitter);  // "https://x.com/blknoiz06"
}
```

### Per-token PnL table (3cr)

```typescript
const tokens = await client.getWalletTokens("7xKXtg...", {
  pageSize: 50,
  sortBy: "realizedPnlSol",
  sortOrder: "DESC",
});

for (const token of tokens.data) {
  console.log(token.tokenAddress, token.realizedPnlSol, token.roi);
}
```

### Batch HUD for multiple wallets (5cr flat)

```typescript
const batch = await client.batchHud(["addr1", "addr2", "addr3"]);

for (const [address, hud] of Object.entries(batch.huds)) {
  console.log(address, hud.behaviorCode, hud.winRate);
}
console.log("No data:", batch.notFound);
```

### Holder profiles — async (20cr)

The `poll` variant queues the job, polls until complete, and returns the result:

```typescript
import type { HolderProfilesResult } from "@sova-intel/sdk";

const result = await client.pollHolderProfiles<HolderProfilesResult>(
  "So11111111111111111111111111111111111111112",
  20, // top N holders
);

for (const holder of result.profiles) {
  console.log(holder.rank, holder.walletAddress, holder.supplyPercent, holder.behaviorType);
}
```

### Similarity analysis — async (20cr)

```typescript
import type { SimilarityResult } from "@sova-intel/sdk";

const result = await client.pollSimilarity<SimilarityResult>(["addr1", "addr2", "addr3"]);

console.log(result.globalMetrics.averageSimilarity);   // 0.73
for (const pair of result.pairwiseSimilarities) {
  console.log(pair.walletA, pair.walletB, pair.binaryScore, pair.capitalScore);
}
```

### Bundled deep analysis — async (35cr)

Holder profiles + similarity in one call. The server discovers holder addresses itself — no need to supply them upfront. Results are returned sequentially: holder-profiles first, then similarity (chained automatically by the processor).

```typescript
import type { HolderProfilesResult, SimilarityResult } from "@sova-intel/sdk";

const { holderProfiles, similarity } = await client.pollDeepAnalysis<
  HolderProfilesResult,
  SimilarityResult
>("So11111111111111111111111111111111111111112", 20);

for (const holder of holderProfiles.profiles) {
  console.log(holder.rank, holder.walletAddress, holder.behaviorType);
}
console.log(similarity.globalMetrics.averageSimilarity);
```

If you want the job descriptors without blocking, use `queueDeepAnalysis`:

```typescript
const jobs = await client.queueDeepAnalysis("TOKEN_MINT", 20);

// jobs.holderProfiles.jobId — poll this first
// jobs.similarity.resultKey — poll this after holderProfiles completes
console.log(jobs.holderProfiles.monitoringUrl);
console.log(jobs.similarity.resultKey);
```

## Client Configuration

```typescript
const client = new SovaIntelClient({
  baseUrl: "https://api.sova-intel.com/api/v1", // required
  auth: { ... },                                 // required
  pollIntervalMs: 5000,                          // default: 5000ms
  maxPollAttempts: 60,                           // default: 60 (~5 min)
});
```

## Error Handling

```typescript
import { SovaIntelClient, SovaHttpError, X402PaymentError } from "@sova-intel/sdk";

try {
  const hud = await client.getWalletHud(address);
} catch (err) {
  if (err instanceof X402PaymentError) {
    // Payment failed
    console.error("Payment error:", err.body);
  } else if (err instanceof SovaHttpError) {
    switch (err.status) {
      case 404: console.error("Wallet not found or result expired"); break;
      case 422: console.error("System/program wallet — skip"); break;
      case 500: console.error("Server error — retry with backoff"); break;
    }
  }
}
```

## Exported Types

```typescript
import type {
  WalletHud,
  WalletProfileResponse,
  WalletSummary,
  WalletBehavior,
  KolIdentity,
  PnlAllTime,
  DataQualityTier,
  TokenPnlRow,
  TokenPnlResponse,
  TokenPnlParams,
  BatchHudResponse,
  HolderProfile,
  HolderProfilesResult,
  SimilarityResult,
  SimilarityPairResult,
  SimilarityGlobalMetrics,
  JobAcceptedResponse,
  DeepJobAcceptedResponse,
  JobStatus,
  SovaIntelClientConfig,
  Auth,
  ApiKeyAuth,
  X402Auth,
} from "@sova-intel/sdk";
```

## Method Reference

| Method | Endpoint | Credits |
|:-------|:---------|--------:|
| `getWalletProfile(addr)` | `GET /intel/wallet/:addr` | 5 |
| `getWalletHud(addr)` | `GET /intel/wallet/:addr/hud` | 1 |
| `getWalletTokens(addr, params?)` | `GET /intel/wallet/:addr/tokens` | 3 |
| `batchHud(wallets[])` | `POST /intel/wallets/batch-hud` | 5 |
| `queueHolderProfiles(mint, topN?)` | `POST /intel/token/:mint/holders` | 20 |
| `pollHolderProfiles(mint, topN?)` | same + auto-poll | 20 |
| `queueSimilarity(wallets[])` | `POST /intel/wallets/similarity` | 20 |
| `pollSimilarity(wallets[])` | same + auto-poll | 20 |
| `queueDeepAnalysis(mint, topN?)` | `POST /intel/token/:mint/holders/deep` | 35 |
| `pollDeepAnalysis(mint, topN?)` | same + auto-poll both results | 35 |
