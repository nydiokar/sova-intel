---
id: errors
sidebar_position: 6
---

# Errors

All errors return JSON with a `message` field and the appropriate HTTP status code.

## Status Codes

| Code | Meaning | Action |
|:----:|:--------|:-------|
| `200` | Success | Data ready, credits charged |
| `202` | Accepted (async) | Job queued — poll and re-call or fetch result |
| `206` | Partial success | One of two bundled jobs failed — 0cr charged, retry individually |
| `400` | Bad request | Fix input — invalid address format or missing required field |
| `401` | Unauthorized | API key missing or malformed |
| `402` | Payment required | Add credits or fund X402 wallet — see [Authentication](/authentication) |
| `403` | Forbidden | Key or wallet is blocked — contact support |
| `404` | Not found | Route wrong, wallet not yet analyzed, or result key expired (15min TTL) |
| `422` | Unprocessable | System or program wallet — not analyzable, skip this address |
| `500` | Server error | Retry with exponential backoff (max 3 attempts) |

## Retry Strategy

```typescript
async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (err instanceof SovaHttpError && err.status === 500 && attempt < maxAttempts) {
        await sleep(1000 * 2 ** attempt); // 2s, 4s, 8s
        continue;
      }
      throw err;
    }
  }
  throw new Error("Max attempts reached");
}
```

## Common Issues

### 404 on result fetch

Result keys expire after 15 minutes. If you poll a job and fetch the result more than 15 minutes after it completes, you'll get 404. Fetch immediately after `status: completed`.

### 422 on wallet analysis

System wallets (token programs, DEX vaults, burn addresses) are not analyzable. The API returns `422` with `skipReason: "known-wallet"`. Skip these addresses in your pipeline.

### 402 with X402

See [X402 common errors](/authentication#common-x402-errors) for the full list of payment failure reasons.
