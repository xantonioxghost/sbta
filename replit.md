# Posture Monitor

A local-first Expo companion app for an ESP32 posture wearable that helps users stay aligned with live feedback, calibration, reminders, and session history.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9, Expo SDK 57
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/posture-monitor/app/(tabs)/index.tsx` — live dashboard
- `artifacts/posture-monitor/app/(tabs)/history.tsx` — local progress summaries
- `artifacts/posture-monitor/app/(tabs)/settings.tsx` — alert and wearable settings
- `artifacts/posture-monitor/app/(tabs)/profile.tsx` — local health profile
- `artifacts/posture-monitor/context/PostureContext.tsx` — shared local state and AsyncStorage persistence
- `artifacts/posture-monitor/components/` — gauge, chart, and shared labels

## Architecture decisions

- v1 is local-first: posture preferences and active-session data stay on the phone; no backend or account is required.
- Shared posture state lives in a React context so dashboard, history, and settings stay in sync.
- The live device boundary is represented by the PostureBelt connection flow; the preview streams safe local readings until a native BLE adapter is installed for a physical build.
- Expo Router tabs use iOS 26 NativeTabs when available and fall back to a custom-themed classic tab bar.

## Product

- Glanceable live deviation gauge with good-posture feedback
- PostureBelt connection state with a preview-safe device adapter
- Three-second baseline calibration flow
- Configurable sensitivity, sustained-alert delay, haptic reminders, and notification preferences
- On-device session chart and daily/weekly posture summaries
- Local health profile for personal basics, posture context, pain areas, injuries, conditions, and mobility limitations

## User preferences

No project-specific preferences recorded yet.

## Gotchas

- Use `pnpm --filter @workspace/posture-monitor run typecheck` for quick checks.
- Expo preview runs through the managed `artifacts/posture-monitor: expo` workflow; do not start Expo with a bare CLI command.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
