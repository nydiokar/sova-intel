---
id: reference
sidebar_position: 4
---

# Behavior Reference

Classification systems, thresholds, and field definitions used across all Sova Intel responses.

---

## Behavior Types

`behaviorType` on holder profiles and `behaviorCategory` on wallet HUD responses share the same classification system, derived from **completed exit cycles only** — positions where the wallet both bought and fully or partially sold.

| Value | Median hold time | Description |
|:------|:-----------------|:------------|
| `SNIPER` | < 1 min | In and out before most see the trade |
| `SCALPER` | 1–5 min | Ultra-fast scalping |
| `MOMENTUM` | 5–30 min | Fast momentum trading |
| `INTRADAY` | 30 min–4 hr | Short-term intraday |
| `DAY_TRADER` | 4–24 hr | Same-day trading |
| `SWING` | 1–7 days | Multi-day swing positions |
| `POSITION` | 7–30 days | Longer-term position trading |
| `HODLER` | 30+ days | Long-term holder |
| `null` | — | Fewer than 2 completed exits — wallet is unclassified |

:::note `behaviorType: null` — not an error
A `null` value means there is not enough exit history to classify the wallet. This is expected for fresh wallets and current holders who bought but haven't sold yet. Check `completedCycleCount` — if it's 0 or 1, the wallet holds but rarely sells.
:::

---

## Data Quality Tiers

| Tier | Completed cycles | Meaning |
|:-----|:----------------:|:--------|
| `GOLD` | 10+ | High confidence — rich, consistent trading history |
| `SILVER` | 5–9 | Good confidence — moderate history |
| `BRONZE` | 3–4 | Low confidence — treat signals with caution |
| `INSUFFICIENT` | < 3 | Not enough data to produce reliable signals |

---

## Exit Patterns

| Value | Description |
|:------|:------------|
| `partial_exit` | Sells in multiple tranches — gradual position reduction |
| `all_at_once` | Exits the full position in a single transaction |

---

## Bot & Whale Flags

| Flag | Condition |
|:-----|:----------|
| `isBot` | More than **60 unique tokens traded per day** — indicates automated or high-frequency behavior |
| `isWhale` | Current portfolio value exceeds **200 SOL** or **$20,000 USD** |
