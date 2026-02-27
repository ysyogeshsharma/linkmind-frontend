'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession } from './SessionWrapper';

export default function Home() {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col items-center gap-12 md:flex-row md:items-center md:justify-between md:gap-16">
        <div className="max-w-xl text-center md:text-left">
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl">
            Create engaging{' '}
            <span className="text-indigo-600">posts</span> with LinkMind
          </h1>
          <p className="mb-10 text-lg leading-relaxed text-slate-600">
            LinkMind helps you generate professional content tailored to your
            interests and industry. Save time and boost your presence.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-start">
            <Link
              href={isAuthenticated ? '/dashboard' : '/login?mode=register'}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md sm:w-auto"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Signup'}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
            {!isAuthenticated && (
              <Link
                href="/dashboard"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-medium text-slate-700 transition-colors hover:bg-slate-50 sm:w-auto"
              >
                Try without account
              </Link>
            )}
          </div>
        </div>
        <div className="flex w-full justify-center md:w-1/2 md:justify-end">
          <div className="relative w-full max-w-md">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 opacity-20 blur-xl" />
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <Image
                src="/assets/app_logo.png"
                alt="LinkMind"
                width={400}
                height={300}
                className="w-full rounded-xl object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
