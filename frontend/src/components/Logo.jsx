import React from 'react'

export default function Logo({ className = "w-12 h-12", ...props }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 512 512" 
      fill="none" 
      className={className} 
      {...props}
    >
      <defs>
        {/* Deep Space Background / Glow Filters */}
        <filter id="core-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="16" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Thesis: Sapphire Blue Gradient (Institutional Proxy) */}
        <linearGradient id="proxy-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Antithesis: Emerald Green Gradient (Egalitarian Challenger) */}
        <linearGradient id="challenger-green" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Synthesis: Golden Accord Core */}
        <linearGradient id="accord-gold" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#FEF08A" />
        </linearGradient>
      </defs>

      {/* Dark Rounded Container */}
      <rect width="512" height="512" rx="128" fill="#0F172A" />
      <rect width="508" height="508" x="2" y="2" rx="126" stroke="#1E293B" strokeWidth="4" />

      {/* Left Orbital Arc (The Proxy Agent) */}
      <path 
        d="M 120 256 C 120 140, 210 90, 280 140 C 330 175, 330 230, 256 256 C 160 290, 140 370, 200 410 C 240 435, 310 420, 360 360" 
        stroke="url(#proxy-blue)" 
        strokeWidth="38" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        opacity="0.9"
      />

      {/* Right Orbital Arc (The Challenger Agent) */}
      <path 
        d="M 392 256 C 392 372, 302 422, 232 372 C 182 337, 182 282, 256 256 C 352 222, 372 142, 312 102 C 272 77, 202 92, 152 152" 
        stroke="url(#challenger-green)" 
        strokeWidth="38" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        opacity="0.9"
      />

      {/* Central Synthesis Sphere (The Golden Accord) */}
      <g filter="url(#core-glow)">
        <circle cx="256" cy="256" r="48" fill="url(#accord-gold)" />
        <circle cx="244" cy="244" r="18" fill="#FFFFFF" opacity="0.4" />
      </g>

      {/* Orbital Satellites / Data Points */}
      <circle cx="152" cy="152" r="14" fill="#60A5FA" />
      <circle cx="360" cy="360" r="14" fill="#34D399" />
    </svg>
  )
}
