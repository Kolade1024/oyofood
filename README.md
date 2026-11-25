# OYO Food — Vendor Portal

Front-end for the OYO Food restaurant/vendor portal, built from the AFT PROJECTS mockups.
Runs entirely on mock data (`src/data/mock.ts`) — no backend yet.

## Run
```bash
npm install
npm run dev        # http://localhost:5173
npm run build
```

## Stack
React 19 + TypeScript + Vite, Tailwind CSS v4, React Router, Recharts, lucide-react.

## Routes
| Route | Screen |
|---|---|
| `/` | Welcome (English / Yoruba) |
| `/login`, `/forgot-password`, `/check-email`, `/reset-password`, `/reset-success` | Auth & recovery |
| `/signup/1` … `/signup/4` | Vendor onboarding (account, profile, address, KYC & payout) |
| `/dashboard` | Operations dashboard |
| `/orders` | Order management & kitchen dispatch (demo handover PIN = order number) |
| `/menu` | Menu & food catalog |
| `/earnings` | Wallet, settlements & payouts |
| `/analytics` | Sales reports |
| `/reviews` | Customer reviews & replies |
| `/promotions` | Coupons & campaigns |
| `/hours` | Operating hours, delivery radius, closures |
| `/settings` | Profile, alerts, security, staff access |

## Structure
- `src/context/AppContext.tsx` — app state (orders, menu, reviews, promos, store open, sign-up draft, toasts)
- `src/components/` — UI kit (`ui.tsx`), auth/onboarding layouts, portal sidebar layout
- `src/pages/` — `auth/`, `onboarding/`, `portal/`

## Next steps for production
Real API + auth (JWT / Google OAuth), Paystack + NIBSS account lookup, file uploads for KYC,
websocket/push for live orders.
