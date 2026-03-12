---
id: async-jobs
sidebar_position: 3
---

# Async Jobs

POST Intel endpoints return HTTP `202` (job accepted). You poll for completion then fetch the result.

---

## How async works

```
1. POST /intel/token/:mint/holders   →  202 { jobId, requestId }
2. GET  /jobs/{jobId}                →  { status: "active", progress: 40 }
3. GET  /jobs/{jobId}                →  { status: "completed", progress: 100 }
4. GET  /jobs/result/by-key?key=...  →  { profiles: [...] }
```

---

## GET /jobs/:jobId

**Poll job status — free, no authentication required**

```bash
curl https://api.sova-intel.com/api/v1/jobs/JOB_ID
```

Poll every **5 seconds**. The endpoint is public — no credits charged, no auth needed.

:::note
Unauthenticated responses include only status metadata. Authenticated responses may include additional fields.
:::

### Response

```json
{
  "status": "active",
  "progress": 65
}
```

| Field | Values |
|:------|:-------|
| `status` | `waiting` \| `active` \| `delayed` \| `completed` \| `failed` |
| `progress` | 0–100 |

When `status` is `completed`, fetch the result.
When `status` is `failed`, retry once then surface the error.

---

## GET /jobs/result/by-key

**Fetch job result — authentication required**

```bash
curl "https://api.sova-intel.com/api/v1/jobs/result/by-key?key=holder-profiles:result:JOB_ID" \
  -H "X-Api-Key: ak_your_key"
```

### Result keys

| Job type | Result key format |
|:---------|:-----------------|
| Holder profiles | `holder-profiles:result:{jobId}` |
| Similarity | `similarity:result:{requestId}` |

:::warning
Use `jobId` for holder profiles but `requestId` for similarity. Check the `202` response carefully.
:::

Result keys expire after **15 minutes**. Returns `404` if expired or not yet ready.

---

## Full polling example

```typescript
import { SovaIntelClient } from "@sova-intel/sdk";

const client = new SovaIntelClient({
  baseUrl: "https://api.sova-intel.com/api/v1",
  auth: { kind: "apikey", apiKey: process.env.SOVA_API_KEY! },
  pollIntervalMs: 5000,   // poll every 5s
  maxPollAttempts: 60,    // give up after 5 minutes
});

// SDK handles polling automatically
const result = await client.pollHolderProfiles("TOKEN_MINT", 20);
```

Or manually without the SDK:

```bash
# 1. Queue the job
JOB=$(curl -s -X POST https://api.sova-intel.com/api/v1/intel/token/TOKEN_MINT/holders \
  -H "X-Api-Key: ak_your_key" \
  -H "Content-Type: application/json" \
  -d '{"topN": 20}')

JOB_ID=$(echo $JOB | jq -r '.jobId')

# 2. Poll until completed
while true; do
  STATUS=$(curl -s "https://api.sova-intel.com/api/v1/jobs/$JOB_ID" | jq -r '.status')
  echo "Status: $STATUS"
  [ "$STATUS" = "completed" ] && break
  [ "$STATUS" = "failed" ] && exit 1
  sleep 5
done

# 3. Fetch result
curl "https://api.sova-intel.com/api/v1/jobs/result/by-key?key=holder-profiles:result:$JOB_ID" \
  -H "X-Api-Key: ak_your_key"
```

---

## GET timeout fallback (202 from GET endpoints)

`GET /intel/wallet/:addr` and `GET /intel/wallet/:addr/hud` normally respond synchronously. On timeout they fall back to async:

```
→ 202 { status: "queued", jobId, prepaidJobId, monitoringUrl }
```

**This is different from POST async.** Do not fetch results from the result store. Instead:

1. Poll `GET /jobs/{jobId}` until `completed`
2. Re-call the original GET endpoint with header `X-Prepaid-Job-Id: {prepaidJobId}`
3. Receive `200` with data — credit charged once total

The SDK handles this automatically in `getWalletProfile()` and `getWalletHud()`.
