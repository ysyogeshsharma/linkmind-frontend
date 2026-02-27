import { NEXT_PUBLIC_API_URL } from './config';

const API_BASE = NEXT_PUBLIC_API_URL;
export async function awakeServer() {
  try {
    const res = await fetch(`${API_BASE}/`, {
      method: "GET",
      cache: "no-store",
    });

    return res.ok;
  } catch (err) {
    console.error("Wake server error:", err);
    return false;
  }
}
export async function registerUser({ name, email, password }) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      return { ok: false, error: data.error || 'Registration failed.' };
    }
    if (!data.user) {
      return { ok: false, error: 'Invalid response from server.' };
    }
    return { ok: true, user: data.user };
  } catch (err) {
    console.error('Register error:', err);
    return { ok: false, error: 'Network error. Please try again.' };
  }
}

export async function validateLogin(email, password) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      return { ok: false, error: data.error || 'Login failed.' };
    }
    if (!data.user) {
      return { ok: false, error: 'Invalid response from server.' };
    }
    return { ok: true, user: data.user };
  } catch (err) {
    console.error('Login error:', err);
    return { ok: false, error: 'Network error. Please try again.' };
  }
}
