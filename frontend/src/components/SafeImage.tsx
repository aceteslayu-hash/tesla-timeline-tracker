"use client";

import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function SafeImage({ src, alt, className = "" }: SafeImageProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`flex flex-col items-center justify-center bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-600 space-y-2 p-6 ${className}`}>
        <ImageIcon className="w-8 h-8 text-zinc-700" />
        <span className="text-xs font-semibold text-zinc-500 font-mono uppercase tracking-widest">Image Unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} transition-opacity duration-300`}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
    />
  );
}
