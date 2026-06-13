# CostLens AI — HR Cost Intelligence Engine

> **AI Hackathon 2025 · Problem Statement #1**
> Turn calendar meetings into project-level HR expenditure insights — no timesheets, no surveillance.

**Live demo:** _deploy to Vercel and paste URL here_

---

## The Problem

Companies track total payroll but almost never track how employee time (and cost) is distributed across projects. Meetings consume huge blocks of expensive engineer, PM, and designer hours — but that cost is invisible.

**CostLens AI solves this** by importing calendar meetings, using Gemini AI to attribute each one to a project, calculating real meeting cost from hourly rates, and surfacing cost leakage, budget overruns, and savings opportunities on a clean privacy-safe dashboard.

---

## Features (mapped to judging criteria)

| Criterion | Weight | Implementation |
|---|---:|---|
| AI project attribution accuracy | 30% | Gemini 1.5 Flash with confidence scores, keyword pre-matching, human review queue for <70% confidence |
| Dashboard quality & usability | 25% | KPI cards, 4 Recharts, budget usage, anomaly summary, most-expensive meeting banner |
| Calendar integration depth | 20% | Google Calendar OAuth (read-only) + demo import fallback sharing the same insert pipeline |
| Data privacy & access control | 15% | Role-based API stripping, `CostValue` component hides exact rates, Supabase RLS, 4 role switcher |
| Innovation | 10% | Hidden cost leakage detection, shadow project detection, AI Cost Optimizer recommendations |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router |
| Frontend | React 18 + Tailwind CSS + Recharts |
| AI | Google Gemini 1.5 Flash |
| Database | Supabase PostgreSQL + Auth + RLS |
| Calendar | Google Calendar API (OAuth read-only) |
| Hosting | Vercel |
| Icons | lucide-react |

---

## Architecture

```
Browser (React 18 + Tailwind + Recharts)
        │  fetch /api/*
        ▼
Next.js 14 App Router  (Vercel)
  ├─ Server Components  ── Supabase (read)
  ├─ Route Handlers     ── Supabase (write) + Gemini API + Google Calendar
  └─ CostValue primitive ── role-aware rate masking
```

---

## Getting Started (local dev)

### 1. Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Gemini API key](https://aistudio.google.com/app/apikey)
- Google OAuth 2.0 credentials (optional — demo import works without it)

### 2. Clone & install

```bash
git clone https://github.com/your-org/costlens-ai
cd costlens-ai
npm install
```

### 3. Environment variables

```bash
cp .env.example .env.local
# Fill in SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY
```

### 4. Database setup

Open your Supabase project → SQL Editor → paste and run:

```
supabase/schema.sql   # creates all tables + RLS policies
supabase/seed.sql     # seeds 6 demo employees + 5 projects
```

### 5. Create demo auth users

In Supabase Dashboard → Authentication → Users → Add user:

| Email | Password | Role to set in `users` table |
|---|---|---|
| admin@acme.com | demo1234 | admin |
| finance@acme.com | demo1234 | finance_manager |
| pm@acme.com | demo1234 | project_manager |
| leadership@acme.com | demo1234 | leadership_viewer |

### 6. Run

```bash
npm run dev   # http://localhost:3000
```

---

## Demo Flow (3–4 min for judges)

1. **Login as Admin** → `admin@acme.com / demo1234`
2. **Calendar Import** → click **Load Demo Company Calendar** → 16 meetings imported
3. **Run AI Attribution** → meetings get projects, confidence scores, AI reasons
4. **Dashboard** → KPIs, project-cost chart, budget overruns highlighted in red, savings card
5. **Review Queue** → fix a low-confidence meeting → dashboard updates live
6. **Anomalies** → see Budget Overrun (CareCircle), Hidden Cost Leakage (engineering in HR meetings), Duplicate Meeting alert
7. **AI Optimizer** → AI-generated savings recommendations (₹27,300/mo total)
8. **Switch role** to **Leadership Viewer** (role switcher in header) → exact rates hidden everywhere, `•••` shown
9. **Reports** → export CSV

---

## Privacy Design

The `CostValue` component renders `•••` instead of exact rupee amounts whenever:
- The field is an **individual hourly rate** or **per-attendee cost contribution**, AND
- The current user role is **not** `admin` or `finance_manager`

This is enforced at two layers:
1. **API layer** — route handlers strip `hourly_rate` and `cost_contribution` fields from JSON responses for non-privileged roles
2. **UI layer** — `CostValue` component respects the current `RoleContext`

Supabase RLS is enabled on all tables. `google_tokens` denies all anon access (service-role only).

---

## Cost Calculation Formula

```
Meeting Duration (hr) = duration_minutes / 60
Attendee Contribution = Duration × Employee Hourly Rate (snapshot at import)
Meeting Total Cost    = Σ Attendee Contributions
Project Cost          = Σ Meeting Total Costs (where project_id = this project)
Budget Used %         = Project Cost / Weekly Budget × 100
```

---

## AI Attribution Prompt (Gemini)

```
You are an HR Cost Intelligence AI.
Classify the meeting into one of the known company projects.

Known projects: {{projects with keywords}}
Meeting: {{title, description, organizer, attendees, duration, recurrence}}

Return only valid JSON:
{
  "project_name": "",
  "confidence": 0.0,
  "reason": "",
  "needs_human_review": true,
  "possible_shadow_project": "",
  "tags": []
}
```

Meetings with confidence < 0.70 are routed to the Human Review Queue automatically.

---

## Roadmap

- Outlook Calendar integration
- Payroll system sync
- Slack/Teams anomaly notifications
- Forecast project cost before budget overrun
- Jira / Linear project sync

---

## Team

Built for AI Hackathon 2025 by **Team CostLens AI**.
