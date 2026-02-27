'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from './SessionWrapper';

const navLinkClass = (active) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    active
      ? 'bg-indigo-50 text-indigo-700'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status, signOut } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isHome = pathname === '/';
  const isDashboard = pathname === '/dashboard';

  const handleSignOut = () => {
    signOut();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="shrink-0 text-xl font-bold tracking-tight text-slate-900 transition-opacity hover:opacity-90"
        >
          LinkMind
        </Link>

        <nav className="flex min-w-0 flex-1 items-center justify-end gap-1 sm:gap-2">
          <div className="ml-4 flex min-w-[180px] shrink-0 items-center justify-end gap-2 sm:ml-6 sm:min-w-[220px]">
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 sm:px-4"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 sm:px-4"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
