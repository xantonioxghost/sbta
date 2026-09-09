import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HealthProfile, Preferences } from '@/context/PostureContext';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const USER_ID_STORAGE_KEY = '@posture-monitor/supabase-user-id';

/**
 * Gets or creates an anonymous UUID for local-to-cloud mapping.
 */
export async function getOrCreateLocalUserId(): Promise<string> {
  const existing = await AsyncStorage.getItem(USER_ID_STORAGE_KEY);
  if (existing) return existing;

  // Generate a random UUID v4
  const newId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

  await AsyncStorage.setItem(USER_ID_STORAGE_KEY, newId);
  return newId;
}

/**
 * Common headers for Supabase PostgREST API
 */
function getHeaders(preferRepresentation = false) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  };
  if (preferRepresentation) {
    headers.Prefer = 'return=representation';
  }
  return headers;
}

/**
 * Syncs user health profile to Supabase.
 */
export async function syncProfileToSupabase(profile: HealthProfile): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const userId = await getOrCreateLocalUserId();
    const payload = {
      id: userId,
      name: profile.name,
      age: profile.age,
      height: profile.height,
      weight: profile.weight,
      posture_goal: profile.postureGoal,
      pain_areas: profile.painAreas,
      injuries: profile.injuries,
      conditions: profile.conditions,
      mobility_limitations: profile.mobilityLimitations,
      updated_at: new Date().toISOString(),
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?on_conflict=id`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch (error) {
    console.warn('Failed to sync profile to Supabase:', error);
    return false;
  }
}

/**
 * Syncs user preferences (alert thresholds, delay) to Supabase.
 */
export async function syncPreferencesToSupabase(preferences: Preferences): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const userId = await getOrCreateLocalUserId();
    const payload = {
      user_id: userId,
      threshold: preferences.threshold,
      delay: preferences.delay,
      notifications: preferences.notifications,
      vibration: preferences.vibration,
      sound: preferences.sound,
      updated_at: new Date().toISOString(),
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/user_preferences?on_conflict=user_id`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch (error) {
    console.warn('Failed to sync preferences to Supabase:', error);
    return false;
  }
}

export type PostureSessionPayload = {
  id?: string;
  startedAt: number;
  endedAt: number;
  durationSeconds: number;
  goodPercentage: number;
  avgAngle: number;
  maxAngle: number;
  alertCount: number;
  sessionType?: string;
  notes?: string;
  readings?: { angle: number; timestamp: number; good: boolean }[];
};

/**
 * Records a completed posture tracking session to Supabase.
 */
export async function saveSessionToSupabase(session: PostureSessionPayload): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const userId = await getOrCreateLocalUserId();
    const payload = {
      user_id: userId,
      started_at: new Date(session.startedAt).toISOString(),
      ended_at: new Date(session.endedAt).toISOString(),
      duration_seconds: session.durationSeconds,
      good_posture_percentage: session.goodPercentage,
      avg_angle: session.avgAngle,
      max_angle: session.maxAngle,
      alert_count: session.alertCount,
      session_type: session.sessionType || 'general',
      notes: session.notes || null,
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/posture_sessions`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const sessionId = data[0]?.id;

    // Subsample readings for chart playback if available
    if (sessionId && session.readings && session.readings.length > 0) {
      const step = Math.max(1, Math.floor(session.readings.length / 50));
      const samples = session.readings
        .filter((_, idx) => idx % step === 0)
        .map((r) => ({
          session_id: sessionId,
          timestamp: new Date(r.timestamp).toISOString(),
          angle: r.angle,
          good: r.good,
        }));

      await fetch(`${SUPABASE_URL}/rest/v1/posture_readings`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(samples),
      }).catch(() => undefined);
    }

    return sessionId || null;
  } catch (error) {
    console.warn('Failed to save session to Supabase:', error);
    return null;
  }
}

/**
 * Fetches recorded sessions from Supabase for this user
 */
export async function fetchSessionsFromSupabase(): Promise<PostureSessionPayload[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const userId = await getOrCreateLocalUserId();
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/posture_sessions?user_id=eq.${userId}&order=started_at.desc&limit=50`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    if (!response.ok) return [];
    const rows = await response.json();
    return rows.map((r: any) => ({
      id: r.id,
      startedAt: new Date(r.started_at).getTime(),
      endedAt: r.ended_at ? new Date(r.ended_at).getTime() : new Date(r.started_at).getTime(),
      durationSeconds: Number(r.duration_seconds) || 0,
      goodPercentage: Number(r.good_posture_percentage) || 100,
      avgAngle: Number(r.avg_angle) || 0,
      maxAngle: Number(r.max_angle) || 0,
      alertCount: Number(r.alert_count) || 0,
      sessionType: r.session_type || 'general',
      notes: r.notes || '',
    }));
  } catch (error) {
    console.warn('Failed to fetch sessions from Supabase:', error);
    return [];
  }
}

/**
 * Deletes a session from Supabase
 */
export async function deleteSessionFromSupabase(sessionId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/posture_sessions?id=eq.${sessionId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return response.ok;
  } catch {
    return false;
  }
}
