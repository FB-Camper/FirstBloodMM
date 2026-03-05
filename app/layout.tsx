import type { Metadata } from "next";
import Link from "next/link";
import { Orbitron, Rajdhani } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["700"] });
const rajdhani = Rajdhani({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "First Blood Bracket Challenge",
  description: "All-Time CoD Rosters Bracket Challenge"
};

const nav = [
  { href: "/bracket", label: "Bracket" },
  { href: "/teams", label: "Teams" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/how-it-works", label: "How it Works" }
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={rajdhani.className}>
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
          <header className="card mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-red-300">First Blood Presents</p>
            <h1 className={`${orbitron.className} text-3xl font-bold uppercase tracking-wider text-white md:text-5xl`}>
              All-Time CoD Rosters — Bracket Challenge
            </h1>
            <nav className="mt-4 flex flex-wrap gap-2">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-red-800/60 bg-red-950/40 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-red-100 transition hover:border-red-500"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
