import React from 'react';
import { GemType, SpecialType } from '../types/game';

interface GemProps {
  type: GemType;
  special?: SpecialType;
  size?: number | string;
  className?: string;
  isSelected?: boolean;
  isHinted?: boolean;
}

export const GemGraphic: React.FC<GemProps> = ({
  type,
  special = 'none',
  size = '100%',
  className = '',
  isSelected = false,
  isHinted = false,
}) => {
  // Render jewel shape based on type matching user reference image
  const renderShape = () => {
    switch (type) {
      // 1. Ruby - Faceted Red Octagon
      case 'ruby':
        return (
          <g>
            <defs>
              <linearGradient id="ruby-main" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff4d6d" />
                <stop offset="40%" stopColor="#e60039" />
                <stop offset="100%" stopColor="#800020" />
              </linearGradient>
              <linearGradient id="ruby-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ff99ab" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#ff3366" stopOpacity="0.2" />
              </linearGradient>
              <filter id="ruby-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#800020" floodOpacity="0.6" />
              </filter>
            </defs>
            <polygon
              points="30,8 70,8 92,30 92,70 70,92 30,92 8,70 8,30"
              fill="url(#ruby-main)"
              filter="url(#ruby-glow)"
              stroke="#590014"
              strokeWidth="1.5"
            />
            {/* Top Table Facet */}
            <polygon points="36,22 64,22 78,36 78,64 64,78 36,78 22,64 22,36" fill="#c70039" stroke="#ff4d6d" strokeWidth="0.8" />
            {/* Inner Sparkle Facets */}
            <polygon points="36,22 50,34 36,46 22,36" fill="url(#ruby-highlight)" />
            <polygon points="64,22 78,36 64,46 50,34" fill="#ff758f" fillOpacity="0.7" />
            <polygon points="36,78 50,66 64,78 50,88" fill="#a00028" />
            {/* Specular White Highlight */}
            <ellipse cx="40" cy="28" rx="8" ry="4" fill="#ffffff" fillOpacity="0.75" transform="rotate(-15 40 28)" />
          </g>
        );

      // 2. Sapphire - Faceted Blue Triangle
      case 'sapphire':
        return (
          <g>
            <defs>
              <linearGradient id="sapphire-main" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#48cae4" />
                <stop offset="35%" stopColor="#0077b6" />
                <stop offset="100%" stopColor="#03045e" />
              </linearGradient>
              <linearGradient id="sapphire-facet" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#90e0ef" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0096c7" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            {/* Outer Triangle with beveled corners */}
            <polygon
              points="50,10 90,82 10,82"
              fill="url(#sapphire-main)"
              stroke="#023e8a"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Center Facet */}
            <polygon points="50,26 76,72 24,72" fill="#0096c7" stroke="#48cae4" strokeWidth="1" />
            {/* Upper Left Shimmer Facet */}
            <polygon points="50,10 50,26 24,72 10,82" fill="url(#sapphire-facet)" />
            {/* Upper Right Shadow Facet */}
            <polygon points="50,10 90,82 76,72 50,26" fill="#005f73" fillOpacity="0.6" />
            {/* Bottom Base Facet */}
            <polygon points="10,82 24,72 76,72 90,82" fill="#03045e" />
            {/* Specular Highlight */}
            <ellipse cx="42" cy="38" rx="6" ry="12" fill="#ffffff" fillOpacity="0.7" transform="rotate(-25 42 38)" />
          </g>
        );

      // 3. Emerald - Stepped Green Trapezoid
      case 'emerald':
        return (
          <g>
            <defs>
              <linearGradient id="emerald-main" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#52b788" />
                <stop offset="50%" stopColor="#2d6a4f" />
                <stop offset="100%" stopColor="#081c15" />
              </linearGradient>
              <linearGradient id="emerald-light" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#b7e4c7" />
                <stop offset="100%" stopColor="#74c69d" />
              </linearGradient>
            </defs>
            {/* Stepped Trapezoid Silhouette */}
            <polygon
              points="34,14 66,14 88,86 12,86"
              fill="url(#emerald-main)"
              stroke="#1b4332"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Inner Elevated Cut */}
            <polygon points="38,26 62,26 74,76 26,76" fill="#40916c" stroke="#74c69d" strokeWidth="1" />
            {/* Top Light Cap */}
            <polygon points="34,14 66,14 62,26 38,26" fill="url(#emerald-light)" />
            {/* Left Refraction */}
            <polygon points="34,14 38,26 26,76 12,86" fill="#95d5b2" fillOpacity="0.6" />
            {/* Right Reflection */}
            <polygon points="66,14 88,86 74,76 62,26" fill="#1b4332" fillOpacity="0.8" />
            {/* Specular Glint */}
            <circle cx="44" cy="22" r="3.5" fill="#ffffff" fillOpacity="0.9" />
            <polygon points="38,32 50,45 36,52" fill="#d8f3dc" fillOpacity="0.45" />
          </g>
        );

      // 4. Topaz - Cushion Cut Golden Yellow Square
      case 'topaz':
        return (
          <g>
            <defs>
              <linearGradient id="topaz-main" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff3b0" />
                <stop offset="30%" stopColor="#ffd166" />
                <stop offset="70%" stopColor="#e09f3e" />
                <stop offset="100%" stopColor="#9e2a2b" />
              </linearGradient>
            </defs>
            {/* Rounded Rect Cushion */}
            <rect
              x="14"
              y="14"
              width="72"
              height="72"
              rx="18"
              fill="url(#topaz-main)"
              stroke="#99582a"
              strokeWidth="2"
            />
            {/* Inner Cushion Facet */}
            <rect
              x="24"
              y="24"
              width="52"
              height="52"
              rx="12"
              fill="#ffbe0b"
              stroke="#fff3b0"
              strokeWidth="1.2"
            />
            {/* Facet Lines radiating to corners */}
            <line x1="14" y1="14" x2="24" y2="24" stroke="#ffe6a7" strokeWidth="1.5" />
            <line x1="86" y1="14" x2="76" y2="24" stroke="#bc6c25" strokeWidth="1.5" />
            <line x1="86" y1="86" x2="76" y2="76" stroke="#7f4f24" strokeWidth="1.5" />
            <line x1="14" y1="86" x2="24" y2="76" stroke="#dda15e" strokeWidth="1.5" />
            {/* Brilliant Diamond Center */}
            <polygon points="50,30 68,50 50,70 32,50" fill="#ffea00" fillOpacity="0.75" />
            {/* Highlight Gleam */}
            <ellipse cx="36" cy="30" rx="9" ry="4" fill="#ffffff" fillOpacity="0.85" transform="rotate(-30 36 30)" />
          </g>
        );

      // 5. Amethyst - Brilliant Purple Hexagon
      case 'amethyst':
        return (
          <g>
            <defs>
              <linearGradient id="amethyst-main" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e0aaff" />
                <stop offset="40%" stopColor="#9d4edd" />
                <stop offset="100%" stopColor="#3c096c" />
              </linearGradient>
            </defs>
            {/* Hexagon with vertical elongation */}
            <polygon
              points="50,10 88,32 88,68 50,90 12,68 12,32"
              fill="url(#amethyst-main)"
              stroke="#240046"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Inner Hexagon Facet */}
            <polygon
              points="50,24 76,40 76,60 50,76 24,60 24,40"
              fill="#7b2cbf"
              stroke="#c77dff"
              strokeWidth="1"
            />
            {/* Facet Divisions */}
            <line x1="50" y1="10" x2="50" y2="24" stroke="#e0aaff" strokeWidth="1.2" />
            <line x1="88" y1="32" x2="76" y2="40" stroke="#9d4edd" strokeWidth="1.2" />
            <line x1="88" y1="68" x2="76" y2="60" stroke="#5a189a" strokeWidth="1.2" />
            <line x1="50" y1="90" x2="50" y2="76" stroke="#3c096c" strokeWidth="1.2" />
            <line x1="12" y1="68" x2="24" y2="60" stroke="#7b2cbf" strokeWidth="1.2" />
            <line x1="12" y1="32" x2="24" y2="40" stroke="#e0aaff" strokeWidth="1.2" />
            {/* Top Shine */}
            <polygon points="50,24 64,34 50,42 36,34" fill="#f72585" fillOpacity="0.4" />
            <ellipse cx="38" cy="30" rx="7" ry="3.5" fill="#ffffff" fillOpacity="0.8" transform="rotate(-30 38 30)" />
          </g>
        );

      // 6. Amber - Pointed Orange Teardrop / Kite Cut
      case 'amber':
        return (
          <g>
            <defs>
              <linearGradient id="amber-main" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#ffb703" />
                <stop offset="45%" stopColor="#fb8500" />
                <stop offset="100%" stopColor="#9e2a2b" />
              </linearGradient>
            </defs>
            {/* Kite Diamond Silhouette */}
            <polygon
              points="50,10 88,38 50,92 12,38"
              fill="url(#amber-main)"
              stroke="#7f2e00"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Top Triangular Table */}
            <polygon points="50,10 88,38 50,38" fill="#f77f00" stroke="#fcbf49" strokeWidth="1" />
            <polygon points="50,10 50,38 12,38" fill="#ffd166" stroke="#fff1b8" strokeWidth="1" />
            {/* Bottom Lower Pavilion Facets */}
            <polygon points="50,38 88,38 50,92" fill="#d62828" stroke="#f77f00" strokeWidth="0.8" />
            <polygon points="50,38 12,38 50,92" fill="#f77f00" stroke="#fcbf49" strokeWidth="0.8" />
            {/* Inner Star Sparkle */}
            <polygon points="50,24 58,38 50,60 42,38" fill="#fff3b0" fillOpacity="0.75" />
            {/* Specular Highlight */}
            <ellipse cx="36" cy="30" rx="5" ry="10" fill="#ffffff" fillOpacity="0.85" transform="rotate(-20 36 30)" />
          </g>
        );

      default:
        return null;
    }
  };

  // Special item overlays
  const renderSpecialOverlay = () => {
    switch (special) {
      case 'horizontal_line':
        return (
          <g className="animate-pulse">
            <line x1="0" y1="50" x2="100" y2="50" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.9" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="#38bdf8" strokeWidth="12" strokeLinecap="round" opacity="0.5" />
            <polygon points="8,50 16,42 16,58" fill="#ffffff" />
            <polygon points="92,50 84,42 84,58" fill="#ffffff" />
          </g>
        );

      case 'vertical_line':
        return (
          <g className="animate-pulse">
            <line x1="50" y1="0" x2="50" y2="100" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.9" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="#38bdf8" strokeWidth="12" strokeLinecap="round" opacity="0.5" />
            <polygon points="50,8 42,16 58,16" fill="#ffffff" />
            <polygon points="50,92 42,84 58,84" fill="#ffffff" />
          </g>
        );

      case 'bomb':
        return (
          <g>
            {/* Pulsing Bomb Starburst Icon */}
            <circle cx="50" cy="50" r="22" fill="#000000" fillOpacity="0.45" />
            <circle cx="50" cy="50" r="16" fill="#f59e0b" className="animate-ping" opacity="0.7" />
            <path
              d="M50 20 L53 38 L71 35 L56 47 L65 63 L49 52 L35 64 L43 47 L29 35 L47 38 Z"
              fill="#fbbf24"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            <circle cx="50" cy="46" r="4" fill="#ffffff" />
          </g>
        );

      case 'rainbow':
        return (
          <g>
            {/* Iridescent Rainbow Prism effect */}
            <circle cx="50" cy="50" r="40" fill="none" stroke="url(#rainbow-grad)" strokeWidth="6" className="animate-spin" style={{ transformOrigin: '50% 50%', animationDuration: '4s' }} />
            <defs>
              <linearGradient id="rainbow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="20%" stopColor="#f59e0b" />
                <stop offset="40%" stopColor="#10b981" />
                <stop offset="60%" stopColor="#06b6d4" />
                <stop offset="80%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            {/* Central Diamond Star */}
            <polygon
              points="50,16 58,42 84,50 58,58 50,84 42,58 16,50 42,42"
              fill="#ffffff"
              filter="drop-shadow(0 0 6px #ffffff)"
            />
          </g>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`relative flex items-center justify-center transition-transform select-none ${className} ${
        isSelected ? 'scale-110 drop-shadow-[0_0_12px_rgba(255,255,255,0.9)] z-20' : ''
      } ${isHinted ? 'animate-bounce' : ''}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)] transition-all duration-150"
      >
        {renderShape()}
        {renderSpecialOverlay()}
      </svg>

      {/* Selected Indicator Ring */}
      {isSelected && (
        <div className="absolute inset-0 rounded-2xl border-2 border-white pointer-events-none animate-pulse shadow-[0_0_15px_#38bdf8]" />
      )}
    </div>
  );
};
