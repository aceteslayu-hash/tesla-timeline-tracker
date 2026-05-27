import Link from "next/link";
import { getAllTopics } from "@/lib/db";
import { Clock, Activity, ArrowRight, Tag } from "lucide-react";

// Server components cache control - forces dynamic data fetching on each request
export const revalidate = 0;

interface PageProps {
  searchParams: {
    category?: string;
  };
}

function getCategoryColor(category: string) {
  const cat = category.toLowerCase();
  if (cat.includes("fsd") || cat.includes("autopilot")) {
    return "bg-red-500/10 text-red-400 border-red-500/20";
  }
  if (cat.includes("spacex")) {
    return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  }
  if (cat.includes("starlink")) {
    return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }
  if (cat.includes("vehicle") || cat.includes("model")) {
    return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
  }
  if (cat.includes("energy") || cat.includes("charge")) {
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  }
  if (cat.includes("giga") || cat.includes("factory")) {
    return "bg-purple-500/10 text-purple-400 border-purple-500/20";
  }
  if (cat.includes("tech") || cat.includes("optimus")) {
    return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
  }
  return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
}

function formatRelativeTime(updatedAtStr: string) {
  try {
    const date = new Date(updatedAtStr + " UTC");
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 60) {
      return `${Math.max(1, diffMins)}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      const days = Math.floor(diffHours / 24);
      return `${days}d ago`;
    }
  } catch {
    return "Just now";
  }
}

const CATEGORIES = [
  "All",
  "FSD & Autopilot",
  "SpaceX",
  "Starlink",
  "Vehicle Updates",
  "Energy & Charging",
  "Gigafactory",
  "New Tech",
  "Corporate"
];

export default async function HomePage({ searchParams }: PageProps) {
  // Read category from search params, default to All
  const activeCategory = searchParams.category || "All";
  
  let topics = await getAllTopics();
  
  // Filter topics based on active category
  if (activeCategory !== "All") {
    topics = topics.filter(
      (topic) => topic.category?.toLowerCase() === activeCategory.toLowerCase()
    );
  }

  return (
    <div className="space-y-10">
      {/* Hero Welcome Banner */}
      <section className="text-center md:text-left py-12 md:py-16 relative overflow-hidden rounded-2xl bg-zinc-900/40 border border-zinc-800/80 p-8 md:p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300">
            <Activity className="w-3 h-3 text-red-500 animate-pulse" />
            <span>Real-time Space & EV Multi-Channel Intelligence Aggregator</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Aerospace & Tesla Live Tracker
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl font-normal">
            An automated news crawler tracking Tesla, SpaceX, and Starlink. Social chatter is filtered and condensed into high-fidelity vertical timelines, featuring direct original images and detailed technical event analyses.
          </p>
        </div>
      </section>

      {/* Category Navigation Menu Bar */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
          <Tag className="w-4 h-4 text-red-500" />
          <span>Filter by Category</span>
        </div>
        <div className="flex flex-wrap gap-2 pb-2 border-b border-zinc-900">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
            const href = cat === "All" ? "/" : `/?category=${encodeURIComponent(cat)}`;
            return (
              <Link
                key={cat}
                href={href}
                className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                  isActive
                    ? "bg-red-500/10 border-red-500/30 text-red-400 shadow-md shadow-red-500/5"
                    : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Topics Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center space-x-2">
              <span>Active {activeCategory === "All" ? "Hot" : activeCategory} Topics</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 font-normal font-mono">
                {topics.length} Topic{topics.length === 1 ? "" : "s"}
              </span>
            </h2>
          </div>
        </div>

        {topics.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
            <p className="text-zinc-400 font-medium">No active topics found in this category.</p>
            <Link href="/" className="inline-flex items-center text-xs text-red-400 hover:underline mt-2">
              Show all topics
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <Link 
                href={`/news/${topic.id}`} 
                key={topic.id}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-zinc-700 transition-all duration-300 shadow-xl"
              >
                {/* Image Header with actual og:image crawl fallback */}
                <div className="aspect-[16/9] w-full overflow-hidden bg-zinc-950 relative border-b border-zinc-800">
                  <img
                    src={topic.image_url || "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80"}
                    alt={topic.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${getCategoryColor(topic.category)} shadow-lg backdrop-blur-sm`}>
                      {topic.category || "General"}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-zinc-950/80 backdrop-blur-sm px-2 py-1 rounded border border-zinc-800 text-[10px] text-zinc-400 font-mono flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-red-500" />
                    <span>{formatRelativeTime(topic.updated_at)}</span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-zinc-100 group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                      {topic.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                      {topic.summary}
                    </p>
                  </div>

                  {/* Metadata and Link CTA */}
                  <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
                    <span className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      <strong className="text-zinc-300 font-mono font-semibold">{topic.event_count || 1}</strong>
                      <span>event{topic.event_count === 1 ? "" : "s"}</span>
                    </span>
                    <span className="flex items-center text-red-400 group-hover:translate-x-1 transition-transform font-semibold">
                      <span>View Timeline</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
