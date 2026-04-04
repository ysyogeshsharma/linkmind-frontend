import "./globals.css";
import SessionWrapper from "./SessionWrapper";
import Header from "./Header";
import WakeProvider from "./WakeProvider";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "TechPost",
  icons: {
    icon: "/assets/app_logo.png",
  },
  description: "Generate professional posts with TechPost",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <WakeProvider>
          <SessionWrapper>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">{children}</div>
              </main>
              <footer className="mt-auto border-t border-slate-200 bg-white/80 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                  <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-center">
                    <p className="text-sm text-slate-500">
                      © {new Date().getFullYear()} TechAtma. All rights
                      reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-slate-500">
                      <a
                        href="#"
                        className="transition-colors hover:text-slate-700"
                      >
                        Terms
                      </a>
                      <a
                        href="#"
                        className="transition-colors hover:text-slate-700"
                      >
                        Privacy
                      </a>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </SessionWrapper>
        </WakeProvider>
      </body>
    </html>
  );
}
