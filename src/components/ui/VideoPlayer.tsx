'use client';

import { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  src?: string;
  poster?: string;
  className?: string;
  maskEdges?: boolean;
}

export default function VideoPlayer({ src, poster, className = '', maskEdges = true }: VideoPlayerProps) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hasError, setHasError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  );

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!ref.current || !src) return;
    const v = ref.current;
    
    // Preload video
    v.preload = 'auto';
    v.muted = true;
    v.playsInline = true;
    v.loop = true;
    
    const play = async () => {
      try {
        // Only autoplay if reduced motion is not preferred
        if (!prefersReducedMotion) {
          v.autoplay = true;
          await v.play();
        }
      } catch {
        console.log('Video autoplay blocked');
      }
    };
    
    // Delay play to ensure video is ready
    const timer = setTimeout(play, 100);
    return () => clearTimeout(timer);
  }, [src, prefersReducedMotion]);

  if (!src || hasError) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden ${className}`}>
        <div className="w-full h-full flex items-center justify-center p-8">
          <div className="max-w-xs text-center">
            <div className="w-28 h-28 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full mb-6 shadow-lg flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 3v6l4-2" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h4 className="text-white text-lg font-semibold mb-2">Cinematic Preview</h4>
            <p className="text-slate-300 text-sm">A professional hero video can be dropped at <span className="font-mono">/public/videos/dsf-hero.mp4</span>.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full rounded-2xl overflow-hidden ${className}`}
      style={maskEdges ? {
        maskImage: 'radial-gradient(ellipse 120% 100% at 50% 100%, transparent 0%, black 60%)',
        WebkitMaskImage: 'radial-gradient(ellipse 120% 100% at 50% 100%, transparent 0%, black 60%)',
      } : {}}
    >
      <video
        ref={ref}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        playsInline
        muted
        loop
        preload="auto"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
