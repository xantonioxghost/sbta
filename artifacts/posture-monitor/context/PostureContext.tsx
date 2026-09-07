import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type ConnectionStatus = 'disconnected' | 'searching' | 'connected';
export type Reading = { angle: number; timestamp: number; good: boolean };
export type Preferences = {
  threshold: number;
  delay: number;
  notifications: boolean;
  vibration: boolean;
  sound: boolean;
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
};

type PostureContextValue = {
  angle: number;
  readings: Reading[];
  status: ConnectionStatus;
  preferences: Preferences;
  profile: HealthProfile;
  sessionStartedAt: number | null;
  badStreak: number;
  alertActive: boolean;
  calibrationStep: number;
  connect: () => void;
  disconnect: () => void;
  calibrate: () => void;
  updatePreferences: (next: Partial<Preferences>) => void;
  updateProfile: (next: HealthProfile) => void;
};

const STORAGE_KEY = '@posture-monitor/preferences';
const PROFILE_STORAGE_KEY = '@posture-monitor/health-profile';
const PostureContext = createContext<PostureContextValue | null>(null);

const defaultPreferences: Preferences = {
  threshold: 15,
  delay: 8,
  notifications: true,
  vibration: true,
  sound: false,
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
};

export function PostureProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [angle, setAngle] = useState(3);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [profile, setProfile] = useState<HealthProfile>(defaultProfile);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [badStreak, setBadStreak] = useState(0);
  const [alertActive, setAlertActive] = useState(false);
  const [calibrationStep, setCalibrationStep] = useState(0);
  const angleRef = useRef(3);
  const statusRef = useRef(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          setPreferences({ ...defaultPreferences, ...JSON.parse(stored) });
        } catch {
          setPreferences(defaultPreferences);
        }
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(PROFILE_STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          setProfile({ ...defaultProfile, ...JSON.parse(stored) });
        } catch {
          setProfile(defaultProfile);
        }
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences)).catch(() => undefined);
  }, [preferences]);

  useEffect(() => {
    AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile)).catch(() => undefined);
  }, [profile]);

  useEffect(() => {
    if (status !== 'connected') return;
    const interval = setInterval(() => {
      const next = Math.max(0, Math.min(31, angleRef.current + (Math.random() - 0.52) * 2.8));
      angleRef.current = next;
      const good = next <= preferences.threshold;
      setAngle(next);
      setReadings((existing) => [...existing, { angle: next, timestamp: Date.now(), good }].slice(-72));
      setBadStreak((current) => {
        const nextStreak = good ? 0 : current + 0.2;
        if (nextStreak >= preferences.delay && !alertActive) {
          setAlertActive(true);
          if (preferences.vibration) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
        if (good) setAlertActive(false);
        return nextStreak;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [alertActive, preferences.delay, preferences.threshold, preferences.vibration, status]);

  const connect = () => {
    if (statusRef.current === 'connected') return;
    setStatus('searching');
    setTimeout(() => {
      setStatus('connected');
      setSessionStartedAt(Date.now());
      setReadings([]);
      setBadStreak(0);
      setAlertActive(false);
      angleRef.current = 3;
      setAngle(3);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 1100);
  };

  const disconnect = () => {
    setStatus('disconnected');
    setSessionStartedAt(null);
    setAlertActive(false);
  };

  const calibrate = () => {
    if (calibrationStep > 0) return;
    setCalibrationStep(3);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const timer = setInterval(() => {
      setCalibrationStep((current) => {
        if (current <= 1) {
          clearInterval(timer);
          angleRef.current = 2;
          setAngle(2);
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
    setPreferences((current) => ({ ...current, ...next }));
  };

  const updateProfile = (next: HealthProfile) => {
    setProfile(next);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const value = useMemo(() => ({
    angle,
    readings,
    status,
    preferences,
    profile,
    sessionStartedAt,
    badStreak,
    alertActive,
    calibrationStep,
    connect,
    disconnect,
    calibrate,
    updatePreferences,
    updateProfile,
  }), [alertActive, angle, badStreak, calibrationStep, preferences, profile, readings, sessionStartedAt, status]);

  return <PostureContext.Provider value={value}>{children}</PostureContext.Provider>;
}

export function usePosture() {
  const value = useContext(PostureContext);
  if (!value) throw new Error('usePosture must be used inside PostureProvider');
  return value;
}