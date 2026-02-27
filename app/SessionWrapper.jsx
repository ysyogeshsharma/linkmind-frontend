'use client';

/**
 * Session state: persisted in localStorage for demo.
 * TODO Backend: Replace with server session (e.g. NextAuth, JWT in httpOnly cookie).
 * - On signIn: call POST /api/auth/login or similar, set session cookie
 * - On signOut: call POST /api/auth/logout, clear cookie
 * - On load: verify session with GET /api/auth/session or middleware
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'linkmind_session';

const SessionContext = createContext();

function getStoredSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.user?.email) return data;
  } catch (_) {}
  return null;
}

function saveSession(session) {
  if (typeof window === 'undefined') return;
  try {
    if (session?.user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (_) {}
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionWrapper');
  return ctx;
}

export default function SessionWrapper({ children }) {
  const [session, setSessionState] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const stored = getStoredSession();
    if (stored?.user) {
      setSessionState(stored);
      setStatus('authenticated');
    } else {
      setSessionState(null);
      setStatus('unauthenticated');
    }
  }, []);

  const signIn = useCallback((user) => {
    const sessionData = {
      user: {
        id: user?.id || `user-${Date.now()}`,
        name: user?.name || 'User',
        email: user?.email || '',
        image: user?.image ?? null,
        role: user?.role || 'user',
      },
    };
    setSessionState(sessionData);
    setStatus('authenticated');
    saveSession(sessionData);
  }, []);

  const signOut = useCallback(() => {
    setSessionState(null);
    setStatus('unauthenticated');
    saveSession(null);
  }, []);

  return (
    <SessionContext.Provider value={{ data: session, status, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}
