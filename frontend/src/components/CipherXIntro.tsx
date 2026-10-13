import React, { useEffect, useState, useRef } from 'react';

interface CipherXIntroProps {
  onComplete: () => void;
}

export const CipherXIntro: React.FC<CipherXIntroProps> = ({ onComplete }) => {
  // Phases: 'darkness' (300ms) -> 'fade-in' (800ms) -> 'hold' (500ms) -> 'fade-out' (600ms) -> 'done'
  const [phase, setPhase] = useState<'darkness' | 'fade-in' | 'hold' | 'fade-out' | 'done'>('darkness');
  const hasStartedRef = useRef(false);

  useEffect(() => {
    // Avoid double-firing in React 18/19 StrictMode
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      // Shortened transition for accessibility
      const timer = setTimeout(() => {
        setPhase('done');
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }

    // Sequence:
    // Phase 1: 0 - 300ms (darkness)
    const t1 = setTimeout(() => {
      setPhase('fade-in');
    }, 300);

    // Phase 2: 300 - 1100ms (800ms neon fade-in)
    const t2 = setTimeout(() => {
      setPhase('hold');
    }, 1100);

    // Phase 3: 1100 - 1600ms (500ms cinematic hold)
    const t3 = setTimeout(() => {
      setPhase('fade-out');
    }, 1600);

    // Phase 4: 1600 - 2200ms (600ms transition to website)
    const t4 = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  if (phase === 'done') {
    return null;
  }

  // Calculate dynamic classes and styles per phase
  const isFadeIn = phase === 'fade-in';
  const isHold = phase === 'hold';
  const isFadeOut = phase === 'fade-out';

  // Wordmark opacity & translate
  let wordmarkOpacity = 0;
  let wordmarkTransform = 'translateY(8px)';
  let glowIntensity = 'drop-shadow(0 0 2px rgba(168, 85, 247, 0.2))';

  if (isFadeIn) {
    wordmarkOpacity = 1;
    wordmarkTransform = 'translateY(0px)';
    glowIntensity = 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.9)) drop-shadow(0 0 35px rgba(124, 58, 237, 0.7)) drop-shadow(0 0 60px rgba(79, 70, 229, 0.4))';
  } else if (isHold) {
    wordmarkOpacity = 1;
    wordmarkTransform = 'translateY(0px)';
    glowIntensity = 'drop-shadow(0 0 12px rgba(168, 85, 247, 0.85)) drop-shadow(0 0 30px rgba(124, 58, 237, 0.55)) drop-shadow(0 0 50px rgba(79, 70, 229, 0.3))';
  } else if (isFadeOut) {
    wordmarkOpacity = 0;
    wordmarkTransform = 'translateY(-4px)';
    glowIntensity = 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.4))';
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#03030A] select-none pointer-events-auto transition-opacity duration-600 ease-in-out ${
        isFadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        transitionDuration: isFadeOut ? '600ms' : '0ms',
      }}
      aria-hidden={isFadeOut}
    >
      {/* Background ambient radial glow */}
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.12)_0%,transparent_65%)] transition-opacity duration-800"
        style={{ opacity: isFadeIn || isHold ? 1 : 0 }}
      />

      {/* Perfectly Centered Neon Wordmark */}
      <div
        className="relative z-10 transition-all ease-out"
        style={{
          opacity: wordmarkOpacity,
          transform: wordmarkTransform,
          filter: glowIntensity,
          transitionDuration: isFadeIn ? '800ms' : isFadeOut ? '600ms' : '500ms',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <span className="font-orbitron text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-widest text-[#F3E8FF] uppercase">
          Cipher<span className="text-[#A855F7]">X</span>
        </span>
      </div>
    </div>
  );
};
