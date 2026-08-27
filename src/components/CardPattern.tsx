import React from 'react';

interface CardPatternProps {
  category: string;
  size?: number;
  accent?: string;
}

/**
 * Renders a unique SVG geometric pattern based on the card's category.
 * Each pattern type maps to a distinct visual motif inspired by Litema wall art.
 */
export const CardPattern: React.FC<CardPatternProps> = ({
  category,
  size = 120,
  accent = 'currentColor',
}) => {
  const patternMap = getPatternForCategory(category);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className="card-pattern"
      aria-hidden="true"
    >
      {patternMap(accent)}
    </svg>
  );
};

function getPatternForCategory(category: string): (accent: string) => React.ReactNode {
  const patterns: Record<string, (c: string) => React.ReactNode> = {
    'Agricultural Geometry': (c) => (
      <g stroke={c} strokeWidth="2" fill="none">
        {[20, 40, 60, 80, 100].map((y) => (
          <path key={y} d={`M 0 ${y} Q 30 ${y - 15}, 60 ${y} Q 90 ${y + 15}, 120 ${y}`} />
        ))}
      </g>
    ),
    'Fluid Dynamics': (c) => (
      <g stroke={c} strokeWidth="1.5" fill="none">
        {[15, 35, 55, 75, 95].map((y) => (
          <path key={y} d={`M 0 ${y} C 20 ${y - 12}, 40 ${y + 12}, 60 ${y} C 80 ${y - 12}, 100 ${y + 12}, 120 ${y}`} />
        ))}
      </g>
    ),
    'Linear Rhythm': (c) => (
      <g stroke={c} strokeWidth="2" fill="none">
        {[0, 1, 2, 3, 4].map((i) => {
          const y = 15 + i * 22;
          return <polyline key={i} points={`0,${y + 10} 15,${y} 30,${y + 10} 45,${y} 60,${y + 10} 75,${y} 90,${y + 10} 105,${y} 120,${y + 10}`} />;
        })}
      </g>
    ),
    'Tectonic Steps': (c) => (
      <g stroke={c} strokeWidth="2" fill="none">
        {[0, 1, 2, 3].map((i) => (
          <polyline key={i} points={`${10 + i * 5},${100 - i * 10} ${30 + i * 5},${100 - i * 10} ${30 + i * 5},${80 - i * 10} ${50 + i * 5},${80 - i * 10} ${50 + i * 5},${60 - i * 10} ${70 + i * 5},${60 - i * 10}`} />
        ))}
      </g>
    ),
    'Diagonal Banding': (c) => (
      <g stroke={c} strokeWidth="3" fill="none" opacity="0.7">
        {[-40, -20, 0, 20, 40, 60, 80, 100, 120].map((x) => (
          <line key={x} x1={x} y1="0" x2={x + 60} y2="120" />
        ))}
      </g>
    ),
    'Rotational Symmetry': (c) => (
      <g stroke={c} strokeWidth="1.5" fill="none">
        {[0, 90, 180, 270].map((angle) => (
          <g key={angle} transform={`rotate(${angle} 60 60)`}>
            <path d="M 60 60 Q 60 30, 85 20 Q 90 50, 60 60" />
          </g>
        ))}
        <circle cx="60" cy="60" r="5" fill={c} opacity="0.5" />
      </g>
    ),
    'Pinwheel Cross': (c) => (
      <g stroke={c} strokeWidth="2" fill="none">
        <line x1="60" y1="10" x2="60" y2="110" />
        <line x1="10" y1="60" x2="110" y2="60" />
        {[0, 90, 180, 270].map((angle) => (
          <g key={angle} transform={`rotate(${angle} 60 60)`}>
            <path d="M 60 60 L 60 25 L 85 60" />
          </g>
        ))}
      </g>
    ),
    'Arc Curvature': (c) => (
      <g stroke={c} strokeWidth="1.5" fill="none">
        {[20, 35, 50, 65, 80].map((r) => (
          <path key={r} d={`M 0 120 A ${r} ${r} 0 0 1 ${r} ${120 - r}`} />
        ))}
        {[20, 35, 50, 65, 80].map((r) => (
          <path key={`tr-${r}`} d={`M 120 0 A ${r} ${r} 0 0 1 ${120 - r} ${r}`} />
        ))}
      </g>
    ),
    'Quadrant Division': (c) => (
      <g stroke={c} strokeWidth="2" fill="none">
        <line x1="60" y1="0" x2="60" y2="120" />
        <line x1="0" y1="60" x2="120" y2="60" />
        <line x1="0" y1="0" x2="120" y2="120" />
        <line x1="120" y1="0" x2="0" y2="120" />
      </g>
    ),
    'Floral Cross': (c) => (
      <g stroke={c} strokeWidth="1.5" fill="none">
        {[0, 90, 180, 270].map((angle) => (
          <g key={angle} transform={`rotate(${angle} 60 60)`}>
            <ellipse cx="60" cy="35" rx="12" ry="22" />
          </g>
        ))}
        <circle cx="60" cy="60" r="8" fill={c} opacity="0.3" />
      </g>
    ),
    'Celestial Geometry': (c) => (
      <g stroke={c} strokeWidth="2" fill="none">
        <polygon points="60,15 70,45 100,45 75,65 85,95 60,75 35,95 45,65 20,45 50,45" />
        <circle cx="60" cy="60" r="10" />
      </g>
    ),
    'Topographical Star': (c) => (
      <g stroke={c} strokeWidth="1.5" fill="none">
        <polygon points="60,10 70,40 105,40 78,58 88,90 60,72 32,90 42,58 15,40 50,40" />
        {[25, 35, 45].map((r) => (
          <rect key={r} x={60 - r / 2} y={60 - r / 2} width={r} height={r} transform={`rotate(45 60 60)`} />
        ))}
      </g>
    ),
    'Checkerboard Tessellation': (c) => (
      <g fill={c} opacity="0.3">
        {Array.from({ length: 5 }).map((_, row) =>
          Array.from({ length: 5 }).map((_, col) =>
            (row + col) % 2 === 0 ? (
              <rect key={`${row}-${col}`} x={col * 24} y={row * 24} width="24" height="24" />
            ) : null
          )
        )}
      </g>
    ),
    'Solar Radiation': (c) => (
      <g stroke={c} strokeWidth="1.5" fill="none">
        <circle cx="60" cy="60" r="15" />
        <circle cx="60" cy="60" r="25" />
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={60 + Math.cos(angle) * 28}
              y1={60 + Math.sin(angle) * 28}
              x2={60 + Math.cos(angle) * 50}
              y2={60 + Math.sin(angle) * 50}
            />
          );
        })}
      </g>
    ),
    'Diamond Lattice': (c) => (
      <g stroke={c} strokeWidth="1.5" fill="none">
        {[0, 1, 2, 3].map((row) =>
          [0, 1, 2, 3].map((col) => (
            <polygon
              key={`${row}-${col}`}
              points={`${15 + col * 30},${row * 30} ${30 + col * 30},${15 + row * 30} ${15 + col * 30},${30 + row * 30} ${col * 30},${15 + row * 30}`}
            />
          ))
        )}
      </g>
    ),
    'Topographical Ridge': (c) => (
      <g stroke={c} strokeWidth="2" fill="none">
        {[0, 1, 2, 3].map((i) => (
          <polyline key={i} points={`0,${95 - i * 15} 30,${70 - i * 15} 60,${80 - i * 15} 90,${60 - i * 15} 120,${75 - i * 15}`} />
        ))}
      </g>
    ),
    'Focal Target': (c) => (
      <g stroke={c} strokeWidth="2" fill="none">
        {[15, 25, 35, 45].map((r) => (
          <circle key={r} cx="60" cy="60" r={r} />
        ))}
        <circle cx="60" cy="60" r="5" fill={c} opacity="0.6" />
      </g>
    ),
    'Labyrinthine Pathways': (c) => (
      <g stroke={c} strokeWidth="2" fill="none">
        <rect x="50" y="50" width="20" height="20" />
        <path d="M 40 110 L 40 40 L 110 40" />
        <path d="M 30 110 L 30 30 L 110 30" />
        <path d="M 20 10 L 20 20 L 110 20 L 110 110 L 20 110 L 20 80" />
        <path d="M 10 10 L 10 10 L 120 10 L 120 120 L 10 120 L 10 70" />
      </g>
    ),
    'Architectural Bond': (c) => (
      <g stroke={c} strokeWidth="1.5" fill="none">
        {[0, 1, 2, 3, 4, 5].map((row) => (
          <React.Fragment key={row}>
            <line x1="0" y1={row * 20} x2="120" y2={row * 20} />
            {[0, 1, 2].map((col) => (
              <line
                key={col}
                x1={(row % 2 === 0 ? 0 : 20) + col * 40}
                y1={row * 20}
                x2={(row % 2 === 0 ? 0 : 20) + col * 40}
                y2={(row + 1) * 20}
              />
            ))}
          </React.Fragment>
        ))}
      </g>
    ),
    'Organic Flora': (c) => (
      <g stroke={c} strokeWidth="1.5" fill="none">
        {[0, 120, 240].map((angle) => (
          <g key={angle} transform={`rotate(${angle} 60 60)`}>
            <ellipse cx="60" cy="32" rx="14" ry="25" />
          </g>
        ))}
        <circle cx="60" cy="60" r="7" fill={c} opacity="0.4" />
      </g>
    ),
    'Orthogonal Grid': (c) => (
      <g stroke={c} strokeWidth="1" fill="none" opacity="0.6">
        {[0, 20, 40, 60, 80, 100, 120].map((pos) => (
          <React.Fragment key={pos}>
            <line x1={pos} y1="0" x2={pos} y2="120" />
            <line x1="0" y1={pos} x2="120" y2={pos} />
          </React.Fragment>
        ))}
        <rect x="20" y="20" width="40" height="40" strokeWidth="2" />
        <rect x="60" y="60" width="40" height="40" strokeWidth="2" />
      </g>
    ),
    'Architectural Wings': (c) => (
      <g stroke={c} strokeWidth="1.5" fill="none">
        <path d="M 60 60 Q 20 20, 10 60 Q 20 100, 60 60" />
        <path d="M 60 60 Q 100 20, 110 60 Q 100 100, 60 60" />
        <path d="M 60 60 Q 30 35, 20 60 Q 30 85, 60 60" />
        <path d="M 60 60 Q 90 35, 100 60 Q 90 85, 60 60" />
        <circle cx="60" cy="60" r="4" fill={c} opacity="0.5" />
      </g>
    ),
    'Rotational Geometry': (c) => (
      <g stroke={c} strokeWidth="2" fill="none">
        <rect x="35" y="35" width="50" height="50" />
        <rect x="35" y="35" width="50" height="50" transform="rotate(45 60 60)" />
      </g>
    ),
    'Spatial Perspective': (c) => (
      <g stroke={c} strokeWidth="1.5" fill="none">
        <polygon points="60,20 100,60 60,100 20,60" />
        <polygon points="60,35 85,60 60,85 35,60" />
        <polygon points="60,48 72,60 60,72 48,60" />
        <line x1="60" y1="20" x2="60" y2="48" opacity="0.4" />
        <line x1="100" y1="60" x2="72" y2="60" opacity="0.4" />
        <line x1="60" y1="100" x2="60" y2="72" opacity="0.4" />
        <line x1="20" y1="60" x2="48" y2="60" opacity="0.4" />
      </g>
    ),
    'Radiating Fan': (c) => (
      <g stroke={c} strokeWidth="1.5" fill="none">
        {Array.from({ length: 9 }).map((_, i) => {
          const angle = (-90 + i * 22.5) * (Math.PI / 180);
          return (
            <line
              key={i}
              x1="60"
              y1="100"
              x2={60 + Math.cos(angle) * 75}
              y2={100 + Math.sin(angle) * 75}
            />
          );
        })}
        <path d="M 60 100 A 50 50 0 0 1 110 100" fill="none" />
        <path d="M 60 100 A 65 65 0 0 1 125 100" fill="none" />
      </g>
    ),
    'Architectural Columns': (c) => (
      <g stroke={c} strokeWidth="2" fill="none">
        {[20, 40, 60, 80, 100].map((x) => (
          <React.Fragment key={x}>
            <line x1={x} y1="15" x2={x} y2="105" />
            <line x1={x - 5} y1="15" x2={x + 5} y2="15" />
            <line x1={x - 5} y1="105" x2={x + 5} y2="105" />
          </React.Fragment>
        ))}
      </g>
    ),
    'Fortification Crenellations': (c) => (
      <g stroke={c} strokeWidth="2" fill="none">
        {[30, 60, 90].map((y) => (
          <polyline key={y} points={`0,${y} 10,${y} 10,${y - 10} 25,${y - 10} 25,${y} 40,${y} 40,${y - 10} 55,${y - 10} 55,${y} 70,${y} 70,${y - 10} 85,${y - 10} 85,${y} 100,${y} 100,${y - 10} 115,${y - 10} 115,${y} 120,${y}`} />
        ))}
      </g>
    ),
  };

  return patterns[category] ?? patterns['Orthogonal Grid'];
}
