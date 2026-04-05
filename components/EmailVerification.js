'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const itemVariants = {
  hidden: { y: 12, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.35 } },
};

export default function EmailVerification({ user, onVerified, onResend, onBack }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await onVerified(user.email, otp);
      if (!result.ok) {
        setError(result.error);
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage('');
    setError('');

    try {
      const result = await onResend(user.email);
      if (result.ok) {
        setResendMessage('Verification code sent successfully!');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      className="mx-auto max-w-md space-y-6 rounded-lg border border-slate-200 bg-white p-8 shadow-lg"
    >
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
          <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Verify Your Email</h2>
        <p className="mt-2 text-sm text-slate-600">
          We've sent a verification code to <strong>{user.email}</strong>
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-slate-700">
            Verification Code
          </label>
          <input
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit code"
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-center text-lg font-mono tracking-widest shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            maxLength={6}
            required
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {resendMessage && (
          <div className="rounded-md bg-green-50 p-3">
            <p className="text-sm text-green-700">{resendMessage}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>

      <div className="text-center space-y-2">
        <p className="text-sm text-slate-600">
          Didn't receive the code?
        </p>
        <button
          onClick={handleResend}
          disabled={resendLoading}
          className="text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resendLoading ? 'Sending...' : 'Resend Code'}
        </button>
      </div>

      {onBack && (
        <div className="text-center">
          <button
            onClick={onBack}
            className="text-sm text-slate-600 hover:text-slate-500"
          >
            ← Back to login
          </button>
        </div>
      )}
    </motion.div>
  );
}