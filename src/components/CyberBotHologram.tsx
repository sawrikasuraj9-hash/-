import React from 'react';
import { motion } from 'motion/react';

interface CyberBotHologramProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isOnline?: boolean;
}

export const CyberBotHologram: React.FC<CyberBotHologramProps> = ({
  size = 'md',
  className = '',
  isOnline = false,
}) => {
  // Dimensions based on size
  const dim = size === 'sm' ? 90 : size === 'lg' ? 220 : 160;

  return (
    <div 
      className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ width: dim, height: dim }}
    >
      {/* Ambient Radial Backlight Glow */}
      <div 
        className="absolute inset-0 rounded-full blur-2xl opacity-60"
        style={{
          background: isOnline 
            ? 'radial-gradient(circle, rgba(16,185,129,0.35) 0%, rgba(6,182,212,0.2) 60%, transparent 80%)'
            : 'radial-gradient(circle, rgba(59,130,246,0.35) 0%, rgba(168,85,247,0.25) 60%, transparent 80%)'
        }}
      />

      <svg
        viewBox="0 0 200 200"
        width={dim}
        height={dim}
        className="overflow-visible drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]"
      >
        <defs>
          {/* Cyber Neon Gradients */}
          <linearGradient id="neonCyanBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>

          <linearGradient id="crownGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#00F0FF" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>

          <linearGradient id="pedestalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284C7" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#0F172A" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
          </linearGradient>

          <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <radialGradient id="beamLight" cx="50%" cy="100%" r="90%">
            <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Holographic Vertical Light Beam */}
        <path
          d="M 60 175 L 140 175 L 165 95 L 35 95 Z"
          fill="url(#beamLight)"
        />

        {/* 2. Holographic Pedestal / Base Discs */}
        {/* Outer Base Ring */}
        <ellipse
          cx="100"
          cy="176"
          rx="72"
          ry="15"
          fill="url(#pedestalGrad)"
          stroke="#0284C7"
          strokeWidth="1.5"
          opacity="0.8"
        />
        {/* Outer Neon Glow Ring */}
        <ellipse
          cx="100"
          cy="176"
          rx="66"
          ry="12"
          fill="none"
          stroke="#00F0FF"
          strokeWidth="2"
          filter="url(#neonGlow)"
          opacity="0.85"
        />
        {/* Tier 2 Disc */}
        <ellipse
          cx="100"
          cy="168"
          rx="52"
          ry="9"
          fill="#0B132B"
          stroke="#38BDF8"
          strokeWidth="1.2"
        />
        {/* Top Disc Highlight */}
        <ellipse
          cx="100"
          cy="167"
          rx="44"
          ry="7"
          fill="#00F0FF"
          opacity="0.25"
        />

        {/* 3. Floating Orbital Rings (Rotating / Pulsing) */}
        {/* Orbit Ring 1 (Tilted Left) */}
        <g transform="rotate(-15 100 105)">
          <ellipse
            cx="100"
            cy="105"
            rx="64"
            ry="24"
            fill="none"
            stroke="url(#neonCyanBlue)"
            strokeWidth="1.5"
            strokeDasharray="6 3"
            opacity="0.65"
          />
          {/* Orbital Satellite Dot 1 */}
          <circle cx="162" cy="104" r="2.5" fill="#00F0FF" filter="url(#neonGlow)" />
          <circle cx="38" cy="106" r="2" fill="#C084FC" filter="url(#neonGlow)" />
        </g>

        {/* Orbit Ring 2 (Tilted Right) */}
        <g transform="rotate(22 100 105)">
          <ellipse
            cx="100"
            cy="105"
            rx="58"
            ry="20"
            fill="none"
            stroke="#00F0FF"
            strokeWidth="1.5"
            opacity="0.5"
          />
          {/* Orbital Satellite Dot 2 */}
          <circle cx="156" cy="105" r="2.5" fill="#38BDF8" filter="url(#neonGlow)" />
          <circle cx="44" cy="105" r="2" fill="#00F0FF" />
        </g>

        {/* 4. Robot Head Assembly */}
        {/* Ear Pods */}
        <rect
          x="42"
          y="93"
          width="8"
          height="18"
          rx="4"
          fill="#0F172A"
          stroke="#00F0FF"
          strokeWidth="1.5"
        />
        <rect
          x="150"
          y="93"
          width="8"
          height="18"
          rx="4"
          fill="#0F172A"
          stroke="#00F0FF"
          strokeWidth="1.5"
        />

        {/* Head Base / Shell */}
        <rect
          x="48"
          y="68"
          width="104"
          height="70"
          rx="34"
          fill="#070E1A"
          stroke="#00F0FF"
          strokeWidth="2.5"
          filter="url(#neonGlow)"
        />

        {/* Inner Cyber Screen Visor */}
        <rect
          x="54"
          y="74"
          width="92"
          height="58"
          rx="27"
          fill="#020816"
          stroke="#1E3A8A"
          strokeWidth="1.5"
        />

        {/* Visor Glare / Glass Reflection */}
        <path
          d="M 62 82 Q 90 76 138 82 Q 130 90 62 90 Z"
          fill="white"
          opacity="0.08"
        />

        {/* Cute Cyber Happy Eyes */}
        {/* Left Eye */}
        <path
          d="M 74 97 Q 82 89 90 97"
          fill="none"
          stroke={isOnline ? "#34D399" : "#00F0FF"}
          strokeWidth="3.5"
          strokeLinecap="round"
          filter="url(#neonGlow)"
        />
        {/* Right Eye */}
        <path
          d="M 110 97 Q 118 89 126 97"
          fill="none"
          stroke={isOnline ? "#34D399" : "#00F0FF"}
          strokeWidth="3.5"
          strokeLinecap="round"
          filter="url(#neonGlow)"
        />

        {/* Cute Cyber Smile */}
        <path
          d="M 94 112 Q 100 117 106 112"
          fill="none"
          stroke={isOnline ? "#34D399" : "#00F0FF"}
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#neonGlow)"
        />

        {/* Cheeks Glow */}
        <circle cx="68" cy="108" r="3" fill="#00F0FF" opacity="0.3" filter="url(#neonGlow)" />
        <circle cx="132" cy="108" r="3" fill="#00F0FF" opacity="0.3" filter="url(#neonGlow)" />

        {/* 5. Glowing Royal Crown */}
        <g transform="translate(0, -2)">
          {/* Crown Base Bar */}
          <path
            d="M 88 57 L 112 57"
            stroke="url(#crownGold)"
            strokeWidth="2"
            strokeLinecap="round"
            filter="url(#neonGlow)"
          />
          {/* Crown 3-Point Tiara */}
          <path
            d="M 86 56 L 82 43 L 94 50 L 100 38 L 106 50 L 118 43 L 114 56 Z"
            fill="none"
            stroke="url(#crownGold)"
            strokeWidth="2"
            strokeLinejoin="round"
            filter="url(#neonGlow)"
          />
          {/* Crown Jewels (3 glowing spheres) */}
          <circle cx="82" cy="42" r="2.2" fill="#00F0FF" filter="url(#neonGlow)" />
          <circle cx="100" cy="37" r="2.5" fill="#38BDF8" filter="url(#neonGlow)" />
          <circle cx="118" cy="42" r="2.2" fill="#00F0FF" filter="url(#neonGlow)" />
        </g>

        {/* Floating Cyber Particle Sparkles */}
        <circle cx="34" cy="62" r="1.5" fill="#00F0FF" opacity="0.7" />
        <circle cx="170" cy="74" r="2" fill="#38BDF8" opacity="0.8" filter="url(#neonGlow)" />
        <circle cx="162" cy="148" r="1.5" fill="#C084FC" opacity="0.6" />
        <circle cx="28" cy="138" r="1.8" fill="#00F0FF" opacity="0.7" />
        <circle cx="100" cy="22" r="1.5" fill="#00F0FF" opacity="0.8" />
      </svg>
    </div>
  );
};
