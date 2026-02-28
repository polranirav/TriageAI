# TriageAI — Monetization & Pricing

> Open Core + Hybrid B2B SaaS — Callers are always free. Clinics pay.

## Pricing Tiers

| Tier | Price | Calls/mo | Target |
|:-----|:------|:---------|:-------|
| **Pilot** | $0 (60 days) | 100 | First-time CHC demo |
| **Clinic** | $249/mo | 200 + $1.75/extra | Small-medium CHC |
| **CHC Growth** | $599/mo | 600 + $1.50/extra | Mid-large CHC |
| **OHT Network** | $1,199/mo | 2,000 + $1.25/extra | Ontario Health Teams |
| **Enterprise** | $3,500+/mo | Custom | Hospital networks |
| **Self-Hosted** | Free (MIT) | Unlimited | IT-capable orgs |

## Unit Economics (Clinic Plan — $249/mo)

| Metric | Value |
|:-------|:------|
| ARPU | $284/month |
| Variable cost | $157/month |
| Gross margin | 45% |
| CAC | $225 |
| LTV (24-mo retention) | $6,816 |
| LTV:CAC | 30:1 |
| Payback | 1.8 months |

## Variable Cost Per Call

| Component | Cost |
|:----------|:-----|
| OpenAI Realtime API (3 min) | $0.62 |
| Twilio Voice (3 min) | $0.03 |
| Twilio number share | $0.005 |
| DB writes | ~$0.001 |
| **Total per call** | **~$0.66** |

## Billing Implementation (Stripe)

| Feature | Tool | Sprint |
|:--------|:-----|:-------|
| Subscription creation | Stripe Billing | Sprint 10 |
| Annual billing (20% off) | Stripe price ID | Sprint 10 |
| Free trial (60 days) | `trial_period_days: 60` | Sprint 10 |
| Metered overage | Stripe Metered Billing | Sprint 10 |
| Invoices + history | Stripe automatic | Sprint 10 |
| Dunning (retry Day 1, 3, 7) | Stripe dunning | Sprint 10 |

**Webhooks to handle:** `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`, `customer.subscription.updated`

## Revenue Projections

| Timeline | Clients | MRR | ARR |
|:---------|:--------|:----|:----|
| 6 months | 2 paid + 1 pilot | $1,148 | $13,776 |
| 18 months | 8 paid + 1 OHT | $4,442 | $53,300 |
| 36 months | 26 paid + 1 enterprise | $19,224 | $230,688 |

## Key Decisions

- **Never charge callers** — patients are always free
- **Price on call volume**, not seat count
- **Free pilot = $67 CAC** — fund 10 simultaneous pilots for < $700/mo
- **Launch at $249/mo**, raise to $299 after 5 paying clients
- **Early adopters get grandfathered** at launch price
