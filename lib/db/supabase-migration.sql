-- ==============================================================================
-- Posture Monitor - Supabase Database Schema & Migration
-- ==============================================================================
-- You can run this file directly in the Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. Tables
-- ==============================================================================

-- 2.1 Profiles Table (User health context, goals, and limitations)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT '',
    age TEXT DEFAULT '',
    height TEXT DEFAULT '',
    weight TEXT DEFAULT '',
    posture_goal TEXT DEFAULT '',
    pain_areas TEXT DEFAULT '',
    injuries TEXT DEFAULT '',
    conditions TEXT DEFAULT '',
    mobility_limitations TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 User Preferences Table (Sensitivity threshold, alert delay, haptics)
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    threshold INTEGER NOT NULL DEFAULT 15,
    delay INTEGER NOT NULL DEFAULT 8,
    notifications BOOLEAN NOT NULL DEFAULT true,
    vibration BOOLEAN NOT NULL DEFAULT true,
    sound BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT user_preferences_user_id_key UNIQUE (user_id)
);

-- 2.3 Posture Tracking Sessions
CREATE TABLE IF NOT EXISTS public.posture_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    good_posture_percentage INTEGER NOT NULL DEFAULT 100,
    avg_angle REAL NOT NULL DEFAULT 0,
    max_angle REAL NOT NULL DEFAULT 0,
    alert_count INTEGER NOT NULL DEFAULT 0,
    session_type TEXT NOT NULL DEFAULT 'general',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.4 Posture Readings (Periodic high-resolution data points for chart playback)
CREATE TABLE IF NOT EXISTS public.posture_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.posture_sessions(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    angle REAL NOT NULL,
    good BOOLEAN NOT NULL
);

-- 2.5 Wearable Devices (ESP32 PostureBelt calibration & registration)
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'PostureBelt',
    ble_address TEXT,
    baseline_angle REAL DEFAULT 0,
    last_connected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 3. Indexes for Fast Queries & Lookups
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_posture_sessions_user_id ON public.posture_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_posture_sessions_started_at ON public.posture_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_posture_readings_session_id ON public.posture_readings(session_id);
CREATE INDEX IF NOT EXISTS idx_posture_readings_timestamp ON public.posture_readings(timestamp ASC);
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON public.devices(user_id);

-- ==============================================================================
-- 4. Auto-update `updated_at` timestamps
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER trg_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_timestamp();

-- ==============================================================================
-- 5. Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posture_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posture_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- Development / Local-first Friendly Policies:
-- Allow read, insert, and update operations for anon and authenticated users
-- When Supabase Auth is enabled, you can restrict access using:
-- USING (auth.uid() = user_id OR auth.uid() = id)

CREATE POLICY "Allow all access to profiles for anon & authenticated users"
ON public.profiles FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all access to preferences for anon & authenticated users"
ON public.user_preferences FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all access to sessions for anon & authenticated users"
ON public.posture_sessions FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all access to readings for anon & authenticated users"
ON public.posture_readings FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all access to devices for anon & authenticated users"
ON public.devices FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);
