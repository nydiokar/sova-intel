---
id: authentication
sidebar_position: 2
---

# Authentication

<a id="x402-autonomous-solana-usdc-payment"></a>

All Intel endpoints require authentication. Two methods are supported.

## API Key

The simplest method. Pass your key in the `X-Api-Key` header on every request. Credits are deducted from your account on each successful response.

```bash
curl https://api.sova-intel.com/api/v1/intel/wallet/WALLET_ADDRESS/hud \
  -H "X-Api-Key: ak_your_key"
```

API keys use the format `ak_<hex>`.

### Create your own API key

Any signed-in user can create their own API keys from the Sova Intel dashboard:

1. Sign up or sign in.
2. Open the user menu in the top-right corner.
3. Click **API Keys**.
4. On the API Keys page (`/dashboard/developer`), enter a description for the key.
5. Click **Generate**.
6. Copy the raw key immediately. It is shown only once.

You can create multiple keys, see their status later, and revoke keys you no longer need. This is fully self-serve; no manual approval from the Sova team is required.

## X402 — Autonomous Solana USDC Payment

Pay per-call directly from a Solana wallet. No pre-funded account, no key required. The protocol is [x402 v2](https://x402.org).

### How it works

1. **Probe** — call any endpoint with no auth → receive HTTP `402`
2. **Read payment instructions** from the `PAYMENT-REQUIRED` response header (base64 JSON)
3. **Build a USDC transaction** paying the required amount to the treasury address
4. **Resend** the original request with `payment-signature` header

Each payment signature is **single-use** (24-hour replay protection).

### Step 1 — Probe

```bash
curl -i https://api.sova-intel.com/api/v1/intel/wallet/WALLET_ADDRESS/hud
# → HTTP 402
# → Header: PAYMENT-REQUIRED: <base64>
```

Decoded `PAYMENT-REQUIRED` header:

```json
{
  "x402Version": 2,
  "accepts": [{
    "scheme": "exact",
    "network": "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
    "asset": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "amount": "15000",
    "payTo": "<TREASURY_PUBKEY>",
    "maxTimeoutSeconds": 60
  }]
}
```

:::tip
Cache `accepts[0].payTo` — it never changes per deployment.
:::

### Step 2 — Build and send payment

```typescript
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

async function buildPayment(
  connection: Connection,
  keypair: Keypair,
  payTo: string,
  amountBaseUnits: bigint,
): Promise<string> {
  const agentAta    = await getAssociatedTokenAddress(USDC_MINT, keypair.publicKey);
  const treasuryAta = await getAssociatedTokenAddress(USDC_MINT, new PublicKey(payTo));
  const { blockhash } = await connection.getLatestBlockhash("confirmed");

  const tx = new Transaction({ recentBlockhash: blockhash, feePayer: keypair.publicKey });
  tx.add(createTransferCheckedInstruction(
    agentAta, USDC_MINT, treasuryAta,
    keypair.publicKey, amountBaseUnits, 6, [], TOKEN_PROGRAM_ID,
  ));
  tx.sign(keypair);

  return Buffer.from(JSON.stringify({
    x402Version: 2,
    scheme: "exact",
    network: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
    payload: { transaction: tx.serialize().toString("base64") },
  })).toString("base64");
}
```

:::important
Always derive the treasury ATA with `getAssociatedTokenAddress(USDC_MINT, new PublicKey(payTo))`. **Do not** use the raw `payTo` pubkey as the transfer destination.
:::

On success, the response includes: `X-Payment-Response: <txSignature>`

### X402 Constants

| Constant | Value |
|:---------|:------|
| USDC mint | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| USDC decimals | `6` |
| Amount | Read from `PAYMENT-REQUIRED` header (string → BigInt) |
| Network | `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` (mainnet) |

### Common X402 Errors

| Error message | Fix |
|:-------------|:----|
| `transfer destination does not match treasury ATA` | Derive ATA — don't use raw `payTo` pubkey |
| `USDC amount N < required M` | Use `amount` from `PAYMENT-REQUIRED` payload exactly |
| `transaction already used (replay attack)` | Use a fresh transaction + fresh blockhash per request |
| `transaction confirmation failed` | Expired blockhash or RPC error — retry with new tx |

### Using X402 with the SDK

Pass a `buildPayment` callback to the client — the SDK handles the 402→pay→retry loop automatically:

```typescript
import { SovaIntelClient } from "@sova-intel/sdk";

const client = new SovaIntelClient({
  baseUrl: "https://api.sova-intel.com/api/v1",
  auth: {
    kind: "x402",
    buildPayment: async (payTo, amountBaseUnits) => {
      // build and return base64 payment header
      return buildPayment(connection, keypair, payTo, amountBaseUnits);
    },
  },
});
```

See the [SDK Quickstart](/sdk) for the complete setup.
