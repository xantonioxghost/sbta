# Posture Monitor

A local-first Expo companion app for an ESP32 posture wearable that helps users stay aligned with live feedback, calibration, reminders, session history, and Supabase cloud sync.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes to Supabase / Postgres (requires `DATABASE_URL`)

## Supabase Database Setup

Posture Monitor supports Supabase for cloud persistence, user profiles, and session analytics while retaining offline local-first functionality.

### 1. Configure Environment Variables
Copy `.env.example` to `.env` and set:
- `DATABASE_URL` — Supabase connection string (URI) with connection pooler (Transaction pooler on port 6543 or Session pooler on port 5432).
- `EXPO_PUBLIC_SUPABASE_URL` — Supabase Project URL (`https://<project-ref>.supabase.co`).
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — Supabase public anonymous API key.

### 2. Apply Database Schema
You can provision the database schema using either method:
- **Option A (Instant in Dashboard)**: Copy the contents of `lib/db/supabase-migration.sql` and run it in your [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql).
- **Option B (Drizzle CLI)**: With `DATABASE_URL` configured in your environment, run:
  ```bash
  pnpm --filter @workspace/db run push
  ```

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9, Expo SDK 57
- Mobile: React Native 0.86, Expo Router, React Native SVG, Expo Haptics
- Database & Backend: Supabase (PostgreSQL), Drizzle ORM, Express 5
- Validation: Zod, `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/posture.ts` — Drizzle ORM relational schema for profiles, preferences, sessions, readings, and devices
- `lib/db/supabase-migration.sql` — Ready-to-run Supabase PostgreSQL migration with tables, indexes, triggers, and Row Level Security (RLS)
- `artifacts/posture-monitor/lib/supabase.ts` — Supabase client and sync helpers with offline fallback
- `artifacts/posture-monitor/lib/bleManager.ts` — Bluetooth Low Energy (BLE) wearable bridge and Nordic UART manager
- `firmware/esp32_posture_belt/` — Complete ESP32 Arduino firmware for the wearable belt (MPU6050 + BLE + buzzer)
- `artifacts/posture-monitor/app/(tabs)/index.tsx` — live dashboard
- `artifacts/posture-monitor/app/(tabs)/history.tsx` — dynamic session history and weekly analytics
- `artifacts/posture-monitor/app/(tabs)/settings.tsx` — alert, wearable, BLE mode, and Supabase cloud status
- `artifacts/posture-monitor/app/(tabs)/profile.tsx` — local health profile
- `artifacts/posture-monitor/context/PostureContext.tsx` — shared state, AsyncStorage persistence, and cloud sync
- `artifacts/posture-monitor/components/` — gauge, chart, and shared labels

## Architecture decisions

- **Local-first with Cloud Sync**: Preferences, active session, and profile remain cached locally in `AsyncStorage`. If Supabase credentials are provided, sessions and profile updates automatically synchronize with Supabase PostgreSQL.
- **Shared posture state**: React context keeps the dashboard, history, profile, and settings in real-time sync.
- **Wearable device boundary**: Connection state streams safe local preview readings until physical BLE adapter is paired.
- **Expo Router tabs**: iOS 26 NativeTabs with liquid glass support, falling back gracefully to custom-themed tabs.

## Product Features

- Glanceable live deviation gauge with good-posture feedback
- PostureBelt connection state with a preview-safe device adapter
- Three-second baseline calibration flow
- Configurable sensitivity, sustained-alert delay, haptic reminders, and notification preferences
- On-device session chart and daily/weekly posture summaries
- Local health profile for personal basics, posture context, pain areas, injuries, conditions, and mobility limitations
- Supabase cloud backup for cross-device sync and historical session archives
