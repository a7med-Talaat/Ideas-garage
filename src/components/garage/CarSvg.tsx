"use client";

interface CarSvgProps {
  color: string;
  size?: number;
  className?: string;
  isActive?: boolean;
  isCompleted?: boolean;
  emoji?: string;
}

export function CarSvg({ color, size = 120, className = "", isActive = true, isCompleted = false, emoji }: CarSvgProps) {
  const bodyColor = color;
  const darkColor = darkenColor(color, 30);
  const lightColor = lightenColor(color, 20);
  const glassColor = "rgba(160, 210, 255, 0.6)";
  const headlightColor = isActive ? "#fff9c4" : "#3a3a4a";

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size * 0.6 }}>
      <svg
        width={size}
        height={size * 0.6}
        viewBox="0 0 120 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shadow */}
        <ellipse cx="60" cy="68" rx="50" ry="4" fill="rgba(0,0,0,0.4)" />

        {/* Car Body - bottom */}
        <rect x="8" y="42" width="104" height="20" rx="4" fill={darkColor} />

        {/* Car Body - main */}
        <path
          d="M15 42 L20 22 Q22 18 26 18 L94 18 Q98 18 100 22 L105 42 Z"
          fill={bodyColor}
        />

        {/* Roof */}
        <path
          d="M32 22 L36 10 Q38 6 42 6 L78 6 Q82 6 84 10 L88 22 Z"
          fill={lightColor}
        />

        {/* Windshield */}
        <path
          d="M35 21 L39 10 Q40 7 42 7 L78 7 Q80 7 81 10 L85 21 Z"
          fill={glassColor}
          opacity="0.85"
        />

        {/* Side windows */}
        <path d="M24 21 L28 12 Q29 10 31 10 L35 10 L32 21 Z" fill={glassColor} opacity="0.7" />
        <path d="M88 10 L90 10 Q92 10 93 12 L96 21 L88 21 Z" fill={glassColor} opacity="0.7" />

        {/* Body shine */}
        <path
          d="M20 38 Q60 34 100 38"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Doors outline */}
        <line x1="60" y1="22" x2="60" y2="42" stroke={darkColor} strokeWidth="1" opacity="0.5" />

        {/* Door handles */}
        <rect x="44" y="32" width="8" height="2" rx="1" fill="rgba(255,255,255,0.3)" />
        <rect x="68" y="32" width="8" height="2" rx="1" fill="rgba(255,255,255,0.3)" />

        {/* Front headlights */}
        <ellipse cx="102" cy="46" rx="5" ry="3" fill={headlightColor} opacity="0.9" />
        <ellipse cx="102" cy="46" rx="3" ry="2" fill="white" opacity={isActive ? "0.8" : "0.1"} />

        {/* Rear lights */}
        <ellipse cx="18" cy="46" rx="5" ry="3" fill={isCompleted ? "#39d98a" : "#f75959"} opacity="0.7" />

        {/* Front grille */}
        <rect x="96" y="51" width="10" height="4" rx="2" fill={darkColor} />
        <line x1="101" y1="51" x2="101" y2="55" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />

        {/* Wheels */}
        <circle cx="32" cy="60" r="9" fill="#1a1a2e" />
        <circle cx="32" cy="60" r="6" fill="#252540" />
        <circle cx="32" cy="60" r="3" fill="#3a3a5a" />
        <circle cx="32" cy="60" r="1.5" fill={bodyColor} opacity="0.6" />

        <circle cx="88" cy="60" r="9" fill="#1a1a2e" />
        <circle cx="88" cy="60" r="6" fill="#252540" />
        <circle cx="88" cy="60" r="3" fill="#3a3a5a" />
        <circle cx="88" cy="60" r="1.5" fill={bodyColor} opacity="0.6" />

        {/* Wheel arch highlights */}
        <path d="M23 58 Q32 52 41 58" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none" />
        <path d="M79 58 Q88 52 97 58" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none" />

        {/* Completed checkmark overlay */}
        {isCompleted && (
          <g>
            <circle cx="60" cy="30" r="12" fill="rgba(57, 217, 138, 0.9)" />
            <path d="M54 30 L58 34 L66 26" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        )}
      </svg>

      {/* Emoji badge */}
      {emoji && !isCompleted && (
        <div
          className="absolute top-0 right-0 text-sm leading-none"
          style={{ transform: "translate(4px, -4px)" }}
        >
          {emoji}
        </div>
      )}

      {/* Active headlight glow */}
      {isActive && !isCompleted && (
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: "6px",
            right: "2px",
            width: "20px",
            height: "8px",
            background: `radial-gradient(ellipse, ${headlightColor}60 0%, transparent 70%)`,
            borderRadius: "50%",
          }}
        />
      )}
    </div>
  );
}

// ─── Color helpers ────────────────────────────────────────────────────────────

function darkenColor(color: string, amount: number): string {
  if (color.startsWith("hsl")) {
    const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (match) {
      const [, h, s, l] = match;
      return `hsl(${h}, ${s}%, ${Math.max(0, parseInt(l) - amount)}%)`;
    }
  }
  // For hex colors
  const hex = color.replace("#", "");
  if (hex.length !== 6) return color;
  const r = Math.max(0, parseInt(hex.slice(0, 2), 16) - amount * 2);
  const g = Math.max(0, parseInt(hex.slice(2, 4), 16) - amount * 2);
  const b = Math.max(0, parseInt(hex.slice(4, 6), 16) - amount * 2);
  return `rgb(${r}, ${g}, ${b})`;
}

function lightenColor(color: string, amount: number): string {
  if (color.startsWith("hsl")) {
    const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (match) {
      const [, h, s, l] = match;
      return `hsl(${h}, ${s}%, ${Math.min(100, parseInt(l) + amount)}%)`;
    }
  }
  const hex = color.replace("#", "");
  if (hex.length !== 6) return color;
  const r = Math.min(255, parseInt(hex.slice(0, 2), 16) + amount * 2);
  const g = Math.min(255, parseInt(hex.slice(2, 4), 16) + amount * 2);
  const b = Math.min(255, parseInt(hex.slice(4, 6), 16) + amount * 2);
  return `rgb(${r}, ${g}, ${b})`;
}
