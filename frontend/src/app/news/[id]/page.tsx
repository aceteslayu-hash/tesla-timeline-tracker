import Link from "next/link";
import { getTopicById, getTimelineEventsByTopicId } from "@/lib/db";
import { ArrowLeft, ExternalLink, MessageSquare, Globe, Clock, FileText, Sparkles, BookOpen } from "lucide-react";
import { Metadata } from "next";

// Server components cache control - forces dynamic data fetching on each request
export const revalidate = 0;

interface Props {
  params: {
    id: string;
  };
}

// Dynamic SEO Metadata generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const topic = await getTopicById(params.id);
  if (!topic) {
    return {
      title: "Topic Not Found - Tesla Live Tracker",
    };
  }
  return {
    title: `${topic.title} - Tesla Live Tracker`,
    description: topic.meta_description || topic.summary,
  };
}

function getSourceIcon(sourceName: string) {
  const name = sourceName.toLowerCase();
  if (name.includes("twitter") || name.includes("x(")) {
    return (
      <svg className="w-3.5 h-3.5 text-zinc-100 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (name.includes("reddit")) {
    return <MessageSquare className="w-4 h-4 text-orange-500" />;
  }
  return <Globe className="w-4 h-4 text-blue-400" />;
}

function getSourceBadgeColor(sourceName: string) {
  const name = sourceName.toLowerCase();
  if (name.includes("twitter") || name.includes("x(")) {
    return "bg-zinc-800 text-zinc-300 border-zinc-700";
  }
  if (name.includes("reddit")) {
    return "bg-orange-500/10 text-orange-400 border-orange-500/20";
  }
  if (name.includes("electrek")) {
    return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
  }
  if (name.includes("teslarati")) {
    return "bg-red-500/10 text-red-400 border-red-500/20";
  }
  return "bg-blue-500/10 text-blue-400 border-blue-500/20";
}

function formatEventTime(timestamp: number) {
  try {
    const date = new Date(timestamp * 1000);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const year = date.getFullYear();
    const month = months[date.getMonth()];
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return {
      dateStr: `${month} ${day}, ${year}`,
      timeStr: `${hours}:${minutes}`
    };
  } catch {
    return { dateStr: "May 27, 2026", timeStr: "Just now" };
  }
}

function renderEditorial(text: string) {
  if (!text) return null;
  const blocks = text.split("\n\n");
  return (
    <div className="space-y-4 text-zinc-300 leading-relaxed font-normal text-sm md:text-base">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (trimmed.startsWith("##")) {
          return (
            <h3 key={idx} className="text-base md:text-lg font-extrabold text-zinc-100 mt-6 border-b border-zinc-800 pb-2 flex items-center space-x-2">
              <span className="w-1.5 h-4 bg-red-500 rounded-sm" />
              <span>{trimmed.replace(/^##\s*/, "")}</span>
            </h3>
          );
        }
        return <p key={idx}>{trimmed}</p>;
      })}
    </div>
  );
}

export default async function NewsDetailPage({ params }: Props) {
  const topic = await getTopicById(params.id);
  
  if (!topic) {
    return (
      <div className="text-center py-24 space-y-4">
        <h2 className="text-2xl font-bold text-zinc-200">Sorry, Topic Not Found</h2>
        <p className="text-zinc-500">This topic might have been removed or does not exist.</p>
        <Link href="/" className="inline-flex items-center text-red-500 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Back to Homepage</span>
        </Link>
      </div>
    );
  }

  const events = await getTimelineEventsByTopicId(params.id);

  return (
    <div className="space-y-12">
      {/* Navigation & Header */}
      <div className="space-y-4">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-zinc-400 hover:text-zinc-100 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Topics</span>
        </Link>

        {/* Hero Meta Card */}
        <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/60 to-zinc-900/20 p-6 md:p-8 space-y-6 shadow-xl">
          <div className="space-y-3">
            <span className="inline-flex items-center text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded border bg-red-500/10 text-red-400 border-red-500/20 shadow-lg">
              {topic.category || "Event"}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-zinc-5 tracking-tight leading-tight">
              {topic.title}
            </h1>
          </div>

          <div className="border-t border-zinc-800/80 pt-6 space-y-3">
            <h4 className="text-xs font-bold uppercase text-red-500 tracking-widest flex items-center space-x-1.5">
              <span>AI Deep Summary</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            </h4>
            <p className="text-sm md:text-base text-zinc-300 leading-relaxed font-normal">
              {topic.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Original Editorial Article Deep-Dive */}
      {topic.editorial_article && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 md:p-8 space-y-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center space-x-2 text-red-400 font-bold text-xs uppercase tracking-widest pb-3 border-b border-zinc-800/60">
            <BookOpen className="w-4.5 h-4.5 text-red-500" />
            <span>Exclusive Editorial Deep-Dive Analysis</span>
          </div>
          {renderEditorial(topic.editorial_article)}
        </div>
      )}

      {/* Timeline Section */}
      <div className="space-y-8">
        <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center space-x-2">
            <span>Timeline Events</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 font-normal font-mono">
              {events.length} Event{events.length === 1 ? "" : "s"}
            </span>
          </h2>
          <span className="text-xs text-zinc-500 font-medium">Latest updates on top</span>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            No timeline events available for this topic.
          </div>
        ) : (
          <div className="relative border-l-2 border-zinc-800 ml-4 md:ml-32 pl-6 md:pl-8 space-y-10 py-2">
            {events.map((event) => {
              const { dateStr, timeStr } = formatEventTime(event.timestamp);
              return (
                <div key={event.id} className="relative group">
                  
                  {/* Timeline bullet nodes with source-specific colors */}
                  <span className="absolute -left-[35px] md:-left-[43px] top-1 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-950 border-2 border-zinc-800 group-hover:border-red-500 transition-colors shadow-lg z-10">
                    {getSourceIcon(event.source_name)}
                  </span>

                  {/* Absolute date badge on the left column (only shown on md screens and wider) */}
                  <div className="hidden md:block absolute -left-[152px] top-1 text-right w-28">
                    <div className="text-sm font-bold text-zinc-300 font-mono tracking-tight">{dateStr}</div>
                    <div className="text-xs text-zinc-500 font-mono mt-0.5 flex items-center justify-end space-x-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-600" />
                      <span>{timeStr}</span>
                    </div>
                  </div>

                  {/* Timeline Event Card */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-5 space-y-5 hover:bg-zinc-900/40 hover:border-zinc-700 transition-all duration-300 shadow-lg">
                    
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/60 pb-3">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getSourceBadgeColor(event.source_name)}`}>
                          {event.source_name}
                        </span>
                        {/* Mobile timestamp (only shown under md screens) */}
                        <div className="md:hidden text-xs text-zinc-500 font-mono flex items-center space-x-1.5">
                          <span>•</span>
                          <span>{dateStr} {timeStr}</span>
                        </div>
                      </div>
                      
                      {/* External Link */}
                      {event.source_url && (
                        <a 
                          href={event.source_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center text-xs text-red-400 hover:text-red-300 font-semibold space-x-1 transition-colors"
                        >
                          <span>Original Article</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="space-y-4">
                      {/* Quick Take (Factual headline) */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold tracking-widest text-red-500 uppercase flex items-center space-x-1">
                          <Sparkles className="w-3 h-3 text-red-500 mr-1 animate-pulse" />
                          <span>Quick Fact</span>
                        </span>
                        <p className="text-zinc-100 font-bold leading-relaxed text-base md:text-lg border-l-2 border-red-500 pl-3">
                          {event.quick_take}
                        </p>
                      </div>

                      {/* Full Detailed Paragraph (Comprehensive explanation) */}
                      {event.full_details && (
                        <div className="space-y-1 bg-zinc-950/40 border border-zinc-800/80 rounded-lg p-3.5 md:p-4">
                          <span className="text-[10px] font-extrabold tracking-widest text-zinc-500 uppercase flex items-center space-x-1">
                            <FileText className="w-3 h-3 text-zinc-500 mr-1" />
                            <span>Detailed Context</span>
                          </span>
                          <p className="text-zinc-300 text-xs md:text-sm leading-relaxed">
                            {event.full_details}
                          </p>
                        </div>
                      )}

                      {/* Cover Photo / Original Scraped Image */}
                      {event.image_url && (
                        <div className="overflow-hidden rounded-lg bg-zinc-950 aspect-[16/9] w-full max-w-2xl border border-zinc-800/80 group-hover:border-zinc-700/80 transition-colors relative">
                          <img
                            src={event.image_url}
                            alt="Event Visual"
                            className="h-full w-full object-cover opacity-90 hover:opacity-100 hover:scale-101 transition-all duration-500"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
