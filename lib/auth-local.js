import { NEXT_PUBLIC_API_URL } from './config';
import {jwtDecode } from 'jwt-decode';
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
    return {
      ok: true,
      user: data.user,
      requiresVerification: data.requiresVerification,
      message: data.message
    };
  } catch (err) {
    console.error('Register error:', err);
    return { ok: false, error: 'Network error. Please try again.' };
  }
}

export async function verifyEmailOTP(email, otp) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();

    if (!res.ok) {
      return { ok: false, error: data.error || 'OTP verification failed.' };
    }

    if (!data.token) {
      return { ok: false, error: 'Invalid response from server.' };
    }

    // Process the user data from JWT
    const decoded = jwtDecode(data.token);
    const user = decoded.user;
    user.tokenExpiry = decoded.exp;
    console.log('Email verification - Decoded JWT user:', user);

    // Ensure we have a proper user ID
    let userId = user.id || user._id;
    if (userId && typeof userId === 'object' && userId.toString) {
      userId = userId.toString();
    }

    if (!userId) {
      console.warn('Email verification - No user ID found, using email as fallback');
      userId = user.email;
    }

    user.id = String(userId);
    console.log('Email verification - Final user.id:', user.id);

    localStorage.setItem('auth_token', data.token);
    return { ok: true, user };
  } catch (err) {
    console.error('Email verification error:', err);
    return { ok: false, error: 'Network error. Please try again.' };
  }
}

export async function resendVerificationCode(email) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

    if (!res.ok) {
      return { ok: false, error: data.error || 'Failed to resend code.' };
    }

    return { ok: true, message: data.message || 'Verification code sent.' };
  } catch (err) {
    console.error('Resend verification error:', err);
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
    if (!data.token) {
      return { ok: false, error: 'Invalid response from server.' };
    }
    const decoded = jwtDecode(data.token);
    let user = decoded.user;
    user.tokenExpiry = decoded.exp;
    console.log('Decoded JWT user:', user);
    console.log('Login response data:', data);
    console.log('Raw user.id:', user.id, 'type:', typeof user.id);
    console.log('Raw user._id:', user._id, 'type:', typeof user._id);

    // If JWT doesn't contain user ID, check response data
    if (!user.id && !user._id && data.user) {
      console.log('Using user data from response:', data.user);
      user = { ...user, ...data.user };
    }

    // If still no user ID, try to get it from profile endpoint
    if (!user.id && !user._id) {
      console.log('JWT and response missing user ID, trying profile endpoint...');
      try {
        const profileRes = await fetch(`${API_BASE}/api/auth/profile`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${data.token}` },
        });

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.user) {
            user = { ...user, ...profileData.user };
            console.log('Got user profile:', user);
          }
        }
      } catch (profileErr) {
        console.error('Failed to get user profile:', profileErr);
      }
    }

    // Ensure we have a proper user ID - prefer id, fallback to _id
    // Handle cases where ID might be an object (like MongoDB ObjectId)
    let userId = user.id || user._id;
    if (userId && typeof userId === 'object' && userId.toString) {
      userId = userId.toString();
    }

    // If still no user ID, use email as last resort (backend may need to accept this)
    if (!userId) {
      console.warn('No user ID found, using email as fallback');
      userId = user.email;
    }

    user.id = String(userId);

    console.log('Final user.id:', user.id, 'type:', typeof user.id);

    localStorage.setItem('auth_token', data.token);
    return { ok: true, user };
  } catch (err) {
    console.error('Login error:', err);
    return { ok: false, error: 'Network error. Please try again.' };
  }
}