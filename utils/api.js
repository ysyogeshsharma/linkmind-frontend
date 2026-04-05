/**
 * Utility functions for API calls with automatic logout on token errors
 */

import { NEXT_PUBLIC_API_URL } from '../lib/config';

/**
 * Makes an authenticated API call with automatic logout on token expiration
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {object} options - fetch options
 * @param {function} signOut - signOut function from useSession
 * @returns {Promise<Response>} - fetch response
 */
export async function authenticatedFetch(endpoint, options = {}, signOut) {
  const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${NEXT_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Check if the response contains the token error
  if (!response.ok) {
    try {
      const data = await response.clone().json();
      if (data.error && data.error.includes('Invalid or expired token')) {
        // Token is invalid/expired, logout user
        if (signOut) {
          signOut();
        }
        // You might want to redirect to login page here
        // For now, we'll just logout
      }
    } catch (e) {
      // If we can't parse the response as JSON, continue normally
    }
  }

  return response;
}

/**
 * Makes an authenticated API call for file uploads with automatic logout on token expiration
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {FormData} formData - FormData object
 * @param {function} signOut - signOut function from useSession
 * @returns {Promise<Response>} - fetch response
 */
export async function authenticatedUpload(endpoint, formData, signOut) {
  const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const headers = {};
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${NEXT_PUBLIC_API_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
    headers,
  });

  // Check if the response contains the token error
  if (!response.ok) {
    try {
      const data = await response.clone().json();
      if (data.error && data.error.includes('Invalid or expired token')) {
        // Token is invalid/expired, logout user
        if (signOut) {
          signOut();
        }
      }
    } catch (e) {
      // If we can't parse the response as JSON, continue normally
    }
  }

  return response;
}