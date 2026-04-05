'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession } from '../SessionWrapper';
import { registerUser, validateLogin, verifyEmailOTP, resendVerificationCode } from '../../lib/auth-local';
import EmailVerification from '../../components/EmailVerification';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, when: 'beforeChildren', staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 12, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.35 } },
};

function LoginContent() {
  const searchParams = useSearchParams();
  const modeFromUrl = searchParams.get('mode') === 'register' ? 'register' : 'signin';
  const [mode, setMode] = useState(modeFromUrl);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const router = useRouter();
  const { signIn, status } = useSession();

  // Keep mode in sync with URL (e.g. user opens /login?mode=register)
  useEffect(() => {
    setMode(searchParams.get('mode') === 'register' ? 'register' : 'signin');
  }, [searchParams]);

  // If already logged in, redirect to dashboard (don't show login page)
  useEffect(() => {
    if (status === 'authenticated') {
      // Use setTimeout to avoid hook ordering issues during logout
      const timer = setTimeout(() => {
        router.replace('/dashboard');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setShowVerification(false);
    setPendingUser(null);
  };

  const handleVerificationSuccess = (user) => {
    signIn(user);
    router.push('/dashboard');
  };

  const handleVerificationCancel = () => {
    setShowVerification(false);
    setPendingUser(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!name.trim()) {
          setError('Please enter your name.');
          setLoading(false);
          return;
        }
        if (!email.trim()) {
          setError('Please enter your email.');
          setLoading(false);
          return;
        }
        if (!password || password.length < 6) {
          setError('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        const result = await registerUser({
          name: name.trim(),
          email: email.trim(),
          password,
        });
        if (!result.ok) {
          setError(result.error || 'Registration failed.');
          setLoading(false);
          return;
        }

        // Check if email verification is required
        if (result.requiresVerification) {
          setPendingUser(result.user);
          setShowVerification(true);
          setError('');
        } else {
          signIn(result.user);
          router.push('/dashboard');
        }
      } else {
        if (!email.trim()) {
          setError('Please enter your email.');
          setLoading(false);
          return;
        }
        if (!password) {
          setError('Please enter your password.');
          setLoading(false);
          return;
        }
        const result = await validateLogin(email.trim(), password);
        if (!result.ok) {
          setError(result.error || 'Login failed.');
          setLoading(false);
          return;
        }
        signIn(result.user);
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render different content based on state, but always call all hooks first
  let content;

  if (status === 'loading') {
    content = (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  } else if (status === 'authenticated') {
    content = (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  } else if (showVerification && pendingUser) {
    content = (
      <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center px-4 py-10">
        <EmailVerification
          email={pendingUser.email}
          onVerified={handleVerificationSuccess}
          onCancel={handleVerificationCancel}
        />
      </div>
    );
  } else {
    content = (
      <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center px-4 py-10">
        <motion.div
          className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-indigo-50/50 p-6 text-center">
            <div className="mx-auto mb-4 flex justify-center">
              {/* <Image
                src="/assets/app_logo.png"
                alt="TechPost"
                width={80}
                height={80}
                className="rounded-xl object-contain"
                priority
              /> */}
            </div>
            <h2 className="text-xl font-bold text-slate-800">TechPost</h2>
            <p className="mt-1 text-sm text-slate-600">
              {mode === 'register'
                ? 'Create an account to use AI post generation'
                : 'Sign in to your account'}
            </p>
          </div>

          <div className="p-6">
            <div className="mb-6 flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-colors ${
                  mode === 'signin'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-colors ${
                  mode === 'register'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-800 placeholder-slate-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              )}
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-800 placeholder-slate-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-800 placeholder-slate-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
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
                    {mode === 'register' ? 'Creating account...' : 'Signing in...'}
                  </>
                ) : (
                  <>
                    {mode === 'register' ? 'Create account' : 'Sign in'}
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-500">
              By continuing, you agree to our{' '}
              <Link href="#" className="text-indigo-600 hover:underline">Terms</Link>
              {' '}and{' '}
              <Link href="#" className="text-indigo-600 hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return content;
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
