import React, { useEffect, useState } from 'react';
import type { Verdict } from '../../lib/types';

export interface MatchRingProps {
  score: number; // 0 to 100
  verdict?: Verdict;
  size?: number; // default 56px
  strokeWidth?: number; // default 3px
  animated?: boolean;
  className?: string;
}

export const MatchRing: React.FC<MatchRingProps> = ({
  score,
  verdict = 'eligible',
  size = 56,
  strokeWidth = 3,
  animated = true,
  className = '',
}) => {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score);
  const [offsetRatio, setOffsetRatio] = useState(animated ? 0 : score / 100);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - offsetRatio * circumference;

  // Determine stroke color
  const strokeColor = {
    eligible: '#D4FF3A', // lime
    likely: '#FFB84D',   // amber
    unclear: '#8C8C96',  // faint / muted
    ineligible: '#FF6B4A', // coral
  }[verdict] || '#D4FF3A';

  useEffect(() => {
    if (!animated) {
      setDisplayScore(Math.round(score));
      setOffsetRatio(score / 100);
      return;
    }

    const duration = 1100; // 1.1s
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Expo-out easing: 1 - 2^(-10 * t)
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const currentScore = Math.round(score * ease);
      setDisplayScore(currentScore);
      setOffsetRatio((score * ease) / 100);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [score, animated]);

  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Match score ${score}%`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          style={{
            transition: animated ? 'stroke-dashoffset 1.1s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          }}
        />
      </svg>
      {/* Centered mono number */}
      <span className="absolute font-mono text-xs font-semibold tabular-nums text-text">
        {displayScore}
      </span>
    </div>
  );
};
