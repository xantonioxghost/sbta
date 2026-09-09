import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const AUTH_TOKEN_KEY = '@posture-monitor/auth-token';
export const AUTH_USER_KEY = '@posture-monitor/auth-user';

export type User = {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
  };
};

export type AuthSession = {
  access_token: string;
  refresh_token: string;
  user: User;
};

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
  };
}

export async function signUp(email: string, password: string, name?: string): Promise<{ session: AuthSession | null; error: string | null }> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { session: null, error: 'Supabase URL/Key is missing' };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        email,
        password,
        data: { name: name || '' },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { session: null, error: data.msg || data.error_description || data.message || 'Failed to sign up' };
    }

    if (data.access_token && data.user) {
      const session: AuthSession = {
        access_token: data.access_token,
        refresh_token: data.refresh_token || '',
        user: data.user,
      };
      await saveSession(session);
      return { session, error: null };
    }

    return { session: null, error: null };
  } catch (err: any) {
    return { session: null, error: err.message || 'Network error' };
  }
}

export async function signIn(email: string, password: string): Promise<{ session: AuthSession | null; error: string | null }> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { session: null, error: 'Supabase URL/Key is missing' };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { session: null, error: data.error_description || data.msg || data.message || 'Invalid email or password' };
    }

    const session: AuthSession = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user: data.user,
    };

    await saveSession(session);
    return { session, error: null };
  } catch (err: any) {
    return { session: null, error: err.message || 'Network error' };
  }
}

export async function signOut(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  await AsyncStorage.removeItem(AUTH_USER_KEY);
}

export async function saveSession(session: AuthSession): Promise<void> {
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, session.access_token);
  await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
}

export async function getStoredSession(): Promise<{ token: string | null; user: User | null }> {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    const userStr = await AsyncStorage.getItem(AUTH_USER_KEY);
    const user = userStr ? JSON.parse(userStr) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}
