'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { verifyEmailOTP, resendVerificationCode } from '../lib/auth-local';

export default function EmailVerification({
  email,
  onVerified,
  onCancel,
  onResendCode
}) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      setLoading(false);
      return;
    }

    try {
      const result = await verifyEmailOTP(email, otp.trim());
      if (!result.ok) {
        setError(result.error || 'Verification failed.');
        setLoading(false);
        return;
      }

      // Verification successful
      onVerified(result.user);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setResendMessage('');
    setError('');

    try {
      const result = await resendVerificationCode(email);
      if (!result.ok) {
        setError(result.error || 'Failed to resend code.');
      } else {
        setResendMessage(result.message || 'Code sent successfully.');
        setTimeout(() => setResendMessage(''), 3000);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:max-w-lg"
    >
      <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-indigo-50/50 p-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
          <svg
            className="h-8 w-8 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800">Verify Your Email</h2>
        <p className="mt-1 text-sm text-slate-600">
          We've sent a 6-digit code to <strong>{email}</strong>
        </p>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-slate-700">
              Verification Code
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(value);
              }}
              placeholder="000000"
              maxLength={6}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-center text-2xl font-mono tracking-widest text-slate-800 placeholder-slate-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              autoFocus
            />
            <p className="mt-1 text-xs text-slate-500">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {resendMessage && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {resendMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg
                  className="h-5 w-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resendLoading}
            className="w-full text-sm text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
          >
            {resendLoading ? 'Sending...' : "Didn't receive code? Resend"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full text-sm text-slate-500 hover:text-slate-700"
          >
            Back to login
          </button>
        </div>
      </div>
    </motion.div>
  );
}