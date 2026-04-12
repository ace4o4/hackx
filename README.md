# Focus Twin — Your Private AI Productivity Companion

> *"An AI twin that lives on your phone, learns how you focus, and coaches you to get better — without your data ever leaving your device."*


🌐 **Live Demo:** [cybersoulz.tech](https://cybersoulz.tech)
---





## What Is This?
Focus Twin is a **mobile-first Progressive Web App** that gives you a personal AI productivity companion — your **Evo Twin**. Unlike dumb timers (Forest) or creepy surveillance dashboards (RescueTime), Focus Twin actually **learns your unique patterns** and tells you what to do differently.

Everything runs on-device. No cloud. No tracking. No account required.

---



## Why This Exists

| The Problem | Existing Solutions | What's Missing |
|---|---|---|
| Students & remote workers can't stay focused | Forest = cute tree, zero intelligence | **Nobody learns YOUR patterns** |
| Screen time apps show data but no action | RescueTime = tracks everything, sends to cloud | **Nobody is private AND intelligent** |
| Productivity advice is generic | "Wake up at 5am" doesn't work for everyone | **Nobody gives personalized coaching** |

**Focus Twin = Forest's simplicity + RescueTime's intelligence + Tamagotchi's emotional hook + 100% privacy**

---

## How It Works

```
1. Open app → Meet your Evo Twin
2. Tap "Start Focus" → Timer + ambient sounds + twin focuses with you
3. Session ends → Twin celebrates, shows your stats
4. Over days → Twin learns your patterns:
   "You focus best 2-4pm on weekdays"
   "Your streak drops after skipping a day"
   "Morning walks boost your afternoon focus by 30%"
5. Twin grows → New moods, animations, personality unlocks as you level up
```

---

## Current State

### ✅ Built & Working

| Area | Status |
|---|---|
| **UI Shell** | Vite + React 18 + TypeScript PWA with dark glassmorphic design |
| **Evo Twin Avatar** | Animated AI character with 6 mood states, cursor-tracking eyes, particles, neon glow |
| **Component Library** | Full shadcn/ui setup with 49 components |
| **Routing** | React Router with Home / Twin / Focus / Profile pages |
| **Styling** | Tailwind CSS + Framer Motion animations |

### 🚧 In Progress

| Area | Status |
|---|---|
| Focus Session System | Timer, session tracking, IndexedDB storage |
| Pattern Engine | Statistical analysis of focus patterns |
| Daily Challenges | Personalized daily micro-goals |
| Twin Evolution | XP system, level-ups, mood unlocks |
| Insights Dashboard | Weekly/monthly productivity analytics |

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | React 18 + TypeScript | Type safety, ecosystem |
| Build | Vite 8 | Fastest dev server |
| Styling | Tailwind CSS 3 + Framer Motion | Dark UI, fluid animations |
| UI | Radix UI (shadcn/ui) | Accessible, customizable components |
| Data | IndexedDB + localStorage | 100% on-device, no cloud needed |
| Analysis | Vanilla TypeScript | Statistical patterns, no ML overhead |
| Audio | Howler.js / Web Audio API | Ambient focus sounds |
| PWA | vite-plugin-pwa | Offline support, installable |
| Auth | Supabase Auth (optional) | Email/Google login, premium management |
| Payments | Razorpay / Stripe | ₹149/month premium subscription |

---

## Project Structure

```
src/
├── components/
│   ├── EvoTwin.tsx          # Animated AI companion (6 moods, eye tracking)
│   ├── FocusSession.tsx     # Focus timer + ambient sounds (planned)
│   ├── InsightCard.tsx      # Pattern insight display (planned)
│   ├── DailyChallenge.tsx   # Today's personalized goal (planned)
│   └── ui/                  # 49 shadcn/ui components
├── lib/
│   ├── patternEngine.ts     # Statistical focus pattern analysis (planned)
│   ├── sessionManager.ts    # Session CRUD on IndexedDB (planned)
│   ├── twinEngine.ts        # XP, leveling, mood management (planned)
│   ├── challengeGen.ts      # Daily challenge generator (planned)
│   └── sounds.ts            # Ambient audio management
├── pages/
│   ├── Dashboard.tsx        # Main dashboard + daily challenge
│   ├── FocusMode.tsx        # Full-screen focus session (planned)
│   └── Insights.tsx         # Weekly/monthly analytics (planned)
└── providers/
    └── AuthProvider.tsx     # Supabase auth wrapper (planned)

docs/
├── idea.txt     # Core vision & contrarian thesis
├── prd.txt      # Full Product Requirements Document
├── arch.txt     # System architecture & data flows
└── tech.txt     # Technology choices with rationale
```

---

## Getting Started

```bash
npm install
npm run bechara-dev
```

Open [http://localhost:5173](http://localhost:5173).

```bash
npm run build     # production build
npm run lint      # ESLint
npm test          # vitest
```

---

## Monetization

| Tier | Price | Features |
|---|---|---|
| **Free** | ₹0 | Focus timer, basic stats, twin (3 moods), 2 sounds |
| **Premium** | ₹149/month | Advanced insights, full twin evolution, all sounds, deep reports, widgets |

---

## Success Metrics

| Metric | Target |
|---|---|
| Time to first focus session | < 60 seconds |
| Day 7 retention | > 40% |
| Day 30 retention | > 20% |
| Free → Premium conversion | > 5% in 30 days |

---

## More Details

See the [`/docs`](./docs) directory for the full Product Requirements Document, architecture diagrams, and tech stack rationale.
