import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tesla Live Tracker - Autopilot, FSD & Corporate Timeline",
  description: "AI-powered timeline tracking of Tesla and FSD hot topics, filtering out social media noise and clutter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen bg-zinc-950 text-zinc-100 flex flex-col`}>
        {/* Glow Effects */}
        <div className="glow-bg top-[-100px] left-[-100px]" />
        <div className="glow-bg bottom-[-200px] right-[-100px]" style={{ animationDelay: "-4s" }} />

        {/* Global Navigation Header */}
        <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <a href="/" className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-widest text-red-500 font-mono">T E S L A</span>
                <span className="px-1.5 py-0.5 bg-zinc-800 text-[10px] uppercase font-bold text-zinc-400 rounded border border-zinc-700 tracking-wider">
                  Live Tracker
                </span>
              </a>
            </div>
            <nav className="flex items-center space-x-6 text-sm font-medium text-zinc-400">
              <a href="/" className="hover:text-zinc-100 transition-colors">Latest Topics</a>
              <span className="text-zinc-700">|</span>
              <span className="text-xs text-zinc-500 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>AI Denoiser Stream Active</span>
              </span>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-zinc-900 bg-zinc-950/60 py-8 text-center text-xs text-zinc-500 relative z-10">
          <div className="max-w-7xl mx-auto px-4">
            <p>© {new Date().getFullYear()} Tesla Live Tracker. Powered by Hermes Automation & LLM processing.</p>
            <p className="mt-1 text-zinc-600">This system automatically crawls, filters, and clusters feeds from Electrek, Teslarati, CleanTechnica, Reddit, and X(Twitter), filtering out personal sentiment and spam.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
