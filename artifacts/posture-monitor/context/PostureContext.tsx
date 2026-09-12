import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  deleteSessionFromSupabase,
  fetchSessionsFromSupabase,
  isSupabaseConfigured,
  saveSessionToSupabase,
  syncPreferencesToSupabase,
  syncProfileToSupabase,
} from '@/lib/supabase';
import { bleManager } from '@/lib/bleManager';
import { useAuth } from '@/context/AuthContext';

import { SpineType } from '@/lib/exercises';

export type ConnectionStatus = 'disconnected' | 'searching' | 'connected';
export type ConnectionMode = 'ble' | 'simulator';
export type Reading = { angle: number; timestamp: number; good: boolean };

export type ThemeMode = 'light' | 'dark' | 'system';

export type Preferences = {
  threshold: number;
  delay: number;
  notifications: boolean;
  vibration: boolean;
  sound: boolean;
  theme: ThemeMode;
};

export type HealthProfile = {
  name: string;
  age: string;
  height: string;
  weight: string;
  postureGoal: string;
  painAreas: string;
  injuries: string;
  conditions: string;
  mobilityLimitations: string;
  spineType: SpineType;
};

export type RecordedSession = {
  id: string;
  startedAt: number;
  endedAt: number;
  durationSeconds: number;
  goodPercentage: number;
  avgAngle: number;
  maxAngle: number;
  alertCount: number;
  sessionType: string;
  notes?: string;
};

type PostureContextValue = {
  angle: number;
  readings: Reading[];
  status: ConnectionStatus;
  connectionMode: ConnectionMode;
  preferences: Preferences;
  profile: HealthProfile;
  sessions: RecordedSession[];
  sessionStartedAt: number | null;
  badStreak: number;
  alertActive: boolean;
  calibrationStep: number;
  isCloudSynced: boolean;
  connect: () => void;
  disconnect: () => void;
  calibrate: () => void;
  setConnectionMode: (mode: ConnectionMode) => void;
  updatePreferences: (next: Partial<Preferences>) => void;
  updateProfile: (next: HealthProfile) => void;
  deleteSession: (id: string) => Promise<void>;
  clearSessions: () => Promise<void>;
  refreshSessions: () => Promise<void>;
  syncWithCloud: () => Promise<void>;
};

const STORAGE_KEY = '@posture-monitor/preferences';
const PROFILE_STORAGE_KEY = '@posture-monitor/health-profile';
const SESSIONS_STORAGE_KEY = '@posture-monitor/recorded-sessions';
const MODE_STORAGE_KEY = '@posture-monitor/connection-mode';

const PostureContext = createContext<PostureContextValue | null>(null);

const defaultPreferences: Preferences = {
  threshold: 15,
  delay: 8,
  notifications: true,
  vibration: true,
  sound: false,
  theme: 'light',
};

const defaultProfile: HealthProfile = {
  name: '',
  age: '',
  height: '',
  weight: '',
  postureGoal: '',
  painAreas: '',
  injuries: '',
  conditions: '',
  mobilityLimitations: '',
  spineType: 'kyphosis',
};

export function PostureProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const userId = user?.id || null;

  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [connectionMode, setConnectionModeState] = useState<ConnectionMode>('ble');
  const [angle, setAngle] = useState(0);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [profile, setProfile] = useState<HealthProfile>(defaultProfile);
  const [sessions, setSessions] = useState<RecordedSession[]>([]);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [badStreak, setBadStreak] = useState(0);
  const [alertActive, setAlertActive] = useState(false);
  const [calibrationStep, setCalibrationStep] = useState(0);

  const statusRef = useRef(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Connect bleManager listeners for real BLE telemetry & status changes
  useEffect(() => {
    bleManager.onStatusChange((nextStatus) => {
      setStatus(nextStatus);
      if (nextStatus === 'connected') {
        setSessionStartedAt(Date.now());
        setReadings([]);
        setBadStreak(0);
        setAlertActive(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    });

    bleManager.onTelemetry((telemetry) => {
      const good = telemetry.angle <= preferences.threshold;
      setAngle(telemetry.angle);
      setReadings((existing) => [...existing, { angle: telemetry.angle, timestamp: Date.now(), good }].slice(-72));
      setAlertActive(telemetry.alert);

      if (telemetry.alert && preferences.vibration) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    });

    bleManager.onError((errMessage) => {
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(`[Bluetooth Connection Error]\n\n${errMessage}`);
      }
    });
  }, [preferences.threshold, preferences.vibration]);

  // Sync profile name from Auth if not set
  useEffect(() => {
    if (user?.user_metadata?.name && !profile.name) {
      setProfile((prev) => ({ ...prev, name: user.user_metadata?.name || '' }));
    }
  }, [user]);

  // Load preferences
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = { ...defaultPreferences, ...JSON.parse(stored) };
          setPreferences(parsed);
          if (isSupabaseConfigured) {
            syncPreferencesToSupabase(parsed, userId).catch(() => undefined);
          }
        } catch {
          setPreferences(defaultPreferences);
        }
      }
    });
  }, [userId]);

  // Load profile
  useEffect(() => {
    AsyncStorage.getItem(PROFILE_STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = { ...defaultProfile, ...JSON.parse(stored) };
          if (user?.user_metadata?.name && !parsed.name) {
            parsed.name = user.user_metadata.name;
          }
          setProfile(parsed);
          if (isSupabaseConfigured) {
            syncProfileToSupabase(parsed, userId).catch(() => undefined);
          }
        } catch {
          setProfile(defaultProfile);
        }
      }
    });
  }, [userId]);

  // Load connection mode
  useEffect(() => {
    AsyncStorage.getItem(MODE_STORAGE_KEY).then((stored) => {
      if (stored === 'ble' || stored === 'simulator') {
        setConnectionModeState(stored);
        bleManager.setMode(stored === 'simulator');
      } else {
        setConnectionModeState('ble');
        bleManager.setMode(false);
      }
    });
  }, []);

  // Load recorded sessions (AsyncStorage + Supabase)
  useEffect(() => {
    AsyncStorage.getItem(SESSIONS_STORAGE_KEY).then(async (stored) => {
      let local: RecordedSession[] = [];
      if (stored) {
        try {
          local = JSON.parse(stored);
        } catch {
          local = [];
        }
      }

      setSessions(local);

      // Fetch from Supabase for this authenticated user
      if (isSupabaseConfigured) {
        const cloudSessions = await fetchSessionsFromSupabase(userId);
        if (cloudSessions.length > 0) {
          setSessions((current) => {
            const map = new Map<string, RecordedSession>();
            current.forEach((s) => map.set(s.id, s));
            cloudSessions.forEach((s) => {
              if (s.id) {
                map.set(s.id, {
                  id: s.id,
                  startedAt: s.startedAt,
                  endedAt: s.endedAt,
                  durationSeconds: s.durationSeconds,
                  goodPercentage: s.goodPercentage,
                  avgAngle: s.avgAngle,
                  maxAngle: s.maxAngle,
                  alertCount: s.alertCount,
                  sessionType: s.sessionType || 'Session',
                  notes: s.notes,
                });
              }
            });
            const merged = Array.from(map.values()).sort((a, b) => b.startedAt - a.startedAt);
            AsyncStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(merged)).catch(() => undefined);
            return merged;
          });
        }
      }
    });
  }, [userId]);

  // Save changes
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences)).catch(() => undefined);
  }, [preferences]);

  useEffect(() => {
    AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile)).catch(() => undefined);
  }, [profile]);

  useEffect(() => {
    AsyncStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions)).catch(() => undefined);
  }, [sessions]);

  const setConnectionMode = (mode: ConnectionMode) => {
    setConnectionModeState(mode);
    bleManager.setMode(mode === 'simulator');
    AsyncStorage.setItem(MODE_STORAGE_KEY, mode).catch(() => undefined);
  };

  const connect = () => {
    if (statusRef.current === 'connected') return;
    bleManager.connect().catch((err) => {
      console.warn('[PostureContext] BLE connect error:', err);
    });
  };

  const disconnect = () => {
    bleManager.disconnect();
    if (sessionStartedAt && readings.length > 0) {
      const endedAt = Date.now();
      const durationSeconds = Math.max(1, Math.round((endedAt - sessionStartedAt) / 1000));
      const goodCount = readings.filter((r) => r.good).length;
      const goodPercentage = Math.round((goodCount / readings.length) * 100);
      const angles = readings.map((r) => r.angle);
      const avgAngle = Math.round((angles.reduce((a, b) => a + b, 0) / angles.length) * 10) / 10;
      const maxAngle = Math.round(Math.max(...angles) * 10) / 10;

      const newSession: RecordedSession = {
        id: 'sess-' + Date.now(),
        startedAt: sessionStartedAt,
        endedAt,
        durationSeconds,
        goodPercentage,
        avgAngle,
        maxAngle,
        alertCount: badStreak > 0 ? 1 : 0,
        sessionType: 'Active tracking',
      };

      setSessions((prev) => [newSession, ...prev]);

      saveSessionToSupabase(
        {
          ...newSession,
          readings,
        },
        userId
      ).catch(() => undefined);
    }

    setStatus('disconnected');
    setSessionStartedAt(null);
    setAlertActive(false);
  };

  const calibrate = () => {
    if (calibrationStep > 0) return;
    setCalibrationStep(3);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    bleManager.sendCalibrate().catch(() => undefined);

    const timer = setInterval(() => {
      setCalibrationStep((current) => {
        if (current <= 1) {
          clearInterval(timer);
          setAngle(0);
          setBadStreak(0);
          setAlertActive(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  };

  const updatePreferences = (next: Partial<Preferences>) => {
    setPreferences((current) => {
      const updated = { ...current, ...next };
      syncPreferencesToSupabase(updated, userId).catch(() => undefined);
      return updated;
    });
  };

  const updateProfile = (next: HealthProfile) => {
    setProfile(next);
    syncProfileToSupabase(next, userId).catch(() => undefined);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const deleteSession = async (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (isSupabaseConfigured) {
      deleteSessionFromSupabase(id).catch(() => undefined);
    }
  };

  const clearSessions = async () => {
    setSessions([]);
    await AsyncStorage.removeItem(SESSIONS_STORAGE_KEY);
  };

  const refreshSessions = async () => {
    if (!isSupabaseConfigured) return;
    const cloudSessions = await fetchSessionsFromSupabase(userId);
    if (cloudSessions.length > 0) {
      const mapped = cloudSessions.map((s) => ({
        id: s.id || 'sess-' + s.startedAt,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
        durationSeconds: s.durationSeconds,
        goodPercentage: s.goodPercentage,
        avgAngle: s.avgAngle,
        maxAngle: s.maxAngle,
        alertCount: s.alertCount,
        sessionType: s.sessionType || 'Session',
        notes: s.notes,
      }));
      setSessions(mapped);
    }
  };

  const syncWithCloud = async () => {
    if (!isSupabaseConfigured) return;
    await Promise.allSettled([
      syncProfileToSupabase(profile, userId),
      syncPreferencesToSupabase(preferences, userId),
      refreshSessions(),
    ]);
  };

  const value = useMemo(
    () => ({
      angle,
      readings,
      status,
      connectionMode,
      preferences,
      profile,
      sessions,
      sessionStartedAt,
      badStreak,
      alertActive,
      calibrationStep,
      isCloudSynced: isSupabaseConfigured,
      connect,
      disconnect,
      calibrate,
      setConnectionMode,
      updatePreferences,
      updateProfile,
      deleteSession,
      clearSessions,
      refreshSessions,
      syncWithCloud,
    }),
    [
      alertActive,
      angle,
      badStreak,
      calibrationStep,
      connectionMode,
      preferences,
      profile,
      readings,
      sessionStartedAt,
      sessions,
      status,
    ]
  );

  return <PostureContext.Provider value={value}>{children}</PostureContext.Provider>;
}

export function usePosture() {
  const value = useContext(PostureContext);
  if (!value) throw new Error('usePosture must be used inside PostureProvider');
  return value;
}