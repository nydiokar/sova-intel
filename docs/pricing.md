---
id: pricing
sidebar_position: 3
---

# Pricing

Sova Intel uses a credit-based pricing model. **1 credit = $0.015 USDC.**

## Free Endpoints

| Endpoint | Auth | Description |
|:---------|:----:|:------------|
| `GET /intel/pricing` | None | Returns current credit prices and pack options |

## Endpoint Prices

| Endpoint | Credits | USD |
|:---------|--------:|----:|
| `GET /intel/wallet/:addr` | 5 | $0.075 |
| `GET /intel/wallet/:addr/hud` | 1 | $0.015 |
| `GET /intel/wallet/:addr/tokens` | 3 | $0.045 |
| `POST /intel/wallets/batch-hud` | 5 | $0.075 |
| `POST /intel/token/:mint/holders` | 20 | $0.30 |
| `POST /intel/token/:mint/holders/agent` | 20 | $0.30 |
| `POST /intel/wallets/similarity` | 20 | $0.30 |
| `POST /intel/wallets/similarity/agent` | 20 | $0.30 |
| `POST /intel/token/:mint/holders/deep` | 35 | $0.525 |

## Charging Model

**GET Intel endpoints** charge on successful `200` delivery only.

**POST async endpoints** charge on accepted `202` (job queued).

**GET timeout fallback `202`** - when a GET endpoint falls back to async due to a slow cold wallet, it returns `202` at **0 credits**. You poll the job, then re-call with the `X-Prepaid-Job-Id` header. The credit is charged only on the final `200`. You never pay twice.

```
GET /intel/wallet/:addr - 5cr total, always:

Cold wallet:
  -> server holds up to 30s
  -> 200 (5cr charged) <- most common
  OR
  -> 202 timeout (0cr) + prepaidJobId
  -> poll job -> re-call with X-Prepaid-Job-Id
  -> 200 (5cr charged)
```

## Buying Credits

Credits are purchased as packs:

| Pack | Credits | Price | Per credit |
|:-----|--------:|------:|:-----------|
| Starter | 1,000 | $15 | $0.015 |
| Builder | 10,000 | $120 | $0.012 |
| Pro | 100,000 | $900 | $0.009 |

Contact the Sova team for pack access.

## X402 Pay-per-call

With [X402 authentication](/authentication#x402--autonomous-solana-usdc-payment), each call pays directly from your Solana USDC wallet. No pre-funded credit balance needed - the exact USDC amount is charged per request.
