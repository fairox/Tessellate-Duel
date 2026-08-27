/**
 * Category visual identity: maps each of the 20 unique categories
 * to a color palette and pattern style for card rendering.
 */

export interface CategoryStyle {
  /** Primary hue (HSL degrees) */
  hue: number;
  /** Accent color (full HSL) */
  accent: string;
  /** Card background gradient */
  bgGradient: string;
  /** Text color for readability on background */
  textColor: string;
  /** SVG pattern type for CardPattern component */
  patternType: 'arcs' | 'zigzag' | 'grid' | 'diamond' | 'radial' | 'spiral' | 'steps' | 'cross' | 'waves' | 'lattice';
}

export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  'Agricultural Geometry': {
    hue: 85,
    accent: 'hsl(85, 55%, 45%)',
    bgGradient: 'linear-gradient(135deg, hsl(85, 30%, 15%) 0%, hsl(85, 40%, 22%) 100%)',
    textColor: 'hsl(85, 40%, 85%)',
    patternType: 'waves',
  },
  'Fluid Dynamics': {
    hue: 200,
    accent: 'hsl(200, 65%, 50%)',
    bgGradient: 'linear-gradient(135deg, hsl(200, 35%, 14%) 0%, hsl(200, 45%, 22%) 100%)',
    textColor: 'hsl(200, 40%, 85%)',
    patternType: 'waves',
  },
  'Linear Rhythm': {
    hue: 35,
    accent: 'hsl(35, 70%, 55%)',
    bgGradient: 'linear-gradient(135deg, hsl(35, 30%, 14%) 0%, hsl(35, 45%, 20%) 100%)',
    textColor: 'hsl(35, 45%, 85%)',
    patternType: 'zigzag',
  },
  'Tectonic Steps': {
    hue: 20,
    accent: 'hsl(20, 60%, 50%)',
    bgGradient: 'linear-gradient(135deg, hsl(20, 30%, 13%) 0%, hsl(20, 40%, 20%) 100%)',
    textColor: 'hsl(20, 40%, 85%)',
    patternType: 'steps',
  },
  'Diagonal Banding': {
    hue: 50,
    accent: 'hsl(50, 65%, 50%)',
    bgGradient: 'linear-gradient(135deg, hsl(50, 30%, 14%) 0%, hsl(50, 40%, 20%) 100%)',
    textColor: 'hsl(50, 40%, 85%)',
    patternType: 'zigzag',
  },
  'Rotational Symmetry': {
    hue: 280,
    accent: 'hsl(280, 55%, 55%)',
    bgGradient: 'linear-gradient(135deg, hsl(280, 30%, 14%) 0%, hsl(280, 40%, 22%) 100%)',
    textColor: 'hsl(280, 35%, 85%)',
    patternType: 'spiral',
  },
  'Pinwheel Cross': {
    hue: 300,
    accent: 'hsl(300, 50%, 55%)',
    bgGradient: 'linear-gradient(135deg, hsl(300, 28%, 14%) 0%, hsl(300, 38%, 22%) 100%)',
    textColor: 'hsl(300, 35%, 85%)',
    patternType: 'cross',
  },
  'Arc Curvature': {
    hue: 170,
    accent: 'hsl(170, 55%, 45%)',
    bgGradient: 'linear-gradient(135deg, hsl(170, 30%, 13%) 0%, hsl(170, 40%, 20%) 100%)',
    textColor: 'hsl(170, 40%, 85%)',
    patternType: 'arcs',
  },
  'Quadrant Division': {
    hue: 60,
    accent: 'hsl(60, 55%, 50%)',
    bgGradient: 'linear-gradient(135deg, hsl(60, 25%, 14%) 0%, hsl(60, 35%, 20%) 100%)',
    textColor: 'hsl(60, 35%, 85%)',
    patternType: 'grid',
  },
  'Floral Cross': {
    hue: 340,
    accent: 'hsl(340, 60%, 55%)',
    bgGradient: 'linear-gradient(135deg, hsl(340, 30%, 14%) 0%, hsl(340, 40%, 22%) 100%)',
    textColor: 'hsl(340, 35%, 85%)',
    patternType: 'cross',
  },
  'Celestial Geometry': {
    hue: 230,
    accent: 'hsl(230, 55%, 55%)',
    bgGradient: 'linear-gradient(135deg, hsl(230, 30%, 12%) 0%, hsl(230, 40%, 20%) 100%)',
    textColor: 'hsl(230, 35%, 85%)',
    patternType: 'radial',
  },
  'Topographical Star': {
    hue: 15,
    accent: 'hsl(15, 65%, 50%)',
    bgGradient: 'linear-gradient(135deg, hsl(15, 30%, 13%) 0%, hsl(15, 42%, 20%) 100%)',
    textColor: 'hsl(15, 40%, 85%)',
    patternType: 'radial',
  },
  'Checkerboard Tessellation': {
    hue: 0,
    accent: 'hsl(0, 0%, 65%)',
    bgGradient: 'linear-gradient(135deg, hsl(0, 0%, 12%) 0%, hsl(0, 0%, 20%) 100%)',
    textColor: 'hsl(0, 0%, 88%)',
    patternType: 'grid',
  },
  'Solar Radiation': {
    hue: 42,
    accent: 'hsl(42, 80%, 55%)',
    bgGradient: 'linear-gradient(135deg, hsl(42, 35%, 13%) 0%, hsl(42, 50%, 20%) 100%)',
    textColor: 'hsl(42, 45%, 85%)',
    patternType: 'radial',
  },
  'Diamond Lattice': {
    hue: 150,
    accent: 'hsl(150, 50%, 45%)',
    bgGradient: 'linear-gradient(135deg, hsl(150, 28%, 13%) 0%, hsl(150, 38%, 20%) 100%)',
    textColor: 'hsl(150, 35%, 85%)',
    patternType: 'diamond',
  },
  'Topographical Ridge': {
    hue: 25,
    accent: 'hsl(25, 55%, 48%)',
    bgGradient: 'linear-gradient(135deg, hsl(25, 28%, 13%) 0%, hsl(25, 38%, 20%) 100%)',
    textColor: 'hsl(25, 38%, 85%)',
    patternType: 'steps',
  },
  'Focal Target': {
    hue: 0,
    accent: 'hsl(0, 65%, 50%)',
    bgGradient: 'linear-gradient(135deg, hsl(0, 30%, 13%) 0%, hsl(0, 40%, 20%) 100%)',
    textColor: 'hsl(0, 35%, 85%)',
    patternType: 'arcs',
  },
  'Labyrinthine Pathways': {
    hue: 260,
    accent: 'hsl(260, 50%, 50%)',
    bgGradient: 'linear-gradient(135deg, hsl(260, 28%, 13%) 0%, hsl(260, 38%, 20%) 100%)',
    textColor: 'hsl(260, 35%, 85%)',
    patternType: 'lattice',
  },
  'Architectural Bond': {
    hue: 10,
    accent: 'hsl(10, 50%, 48%)',
    bgGradient: 'linear-gradient(135deg, hsl(10, 25%, 13%) 0%, hsl(10, 35%, 20%) 100%)',
    textColor: 'hsl(10, 35%, 85%)',
    patternType: 'grid',
  },
  'Organic Flora': {
    hue: 120,
    accent: 'hsl(120, 45%, 45%)',
    bgGradient: 'linear-gradient(135deg, hsl(120, 25%, 13%) 0%, hsl(120, 35%, 20%) 100%)',
    textColor: 'hsl(120, 35%, 85%)',
    patternType: 'spiral',
  },
  'Orthogonal Grid': {
    hue: 210,
    accent: 'hsl(210, 45%, 50%)',
    bgGradient: 'linear-gradient(135deg, hsl(210, 25%, 13%) 0%, hsl(210, 35%, 20%) 100%)',
    textColor: 'hsl(210, 35%, 85%)',
    patternType: 'grid',
  },
  'Architectural Wings': {
    hue: 190,
    accent: 'hsl(190, 55%, 48%)',
    bgGradient: 'linear-gradient(135deg, hsl(190, 28%, 13%) 0%, hsl(190, 40%, 20%) 100%)',
    textColor: 'hsl(190, 38%, 85%)',
    patternType: 'arcs',
  },
  'Rotational Geometry': {
    hue: 315,
    accent: 'hsl(315, 50%, 52%)',
    bgGradient: 'linear-gradient(135deg, hsl(315, 28%, 14%) 0%, hsl(315, 38%, 22%) 100%)',
    textColor: 'hsl(315, 35%, 85%)',
    patternType: 'diamond',
  },
  'Spatial Perspective': {
    hue: 245,
    accent: 'hsl(245, 50%, 55%)',
    bgGradient: 'linear-gradient(135deg, hsl(245, 28%, 13%) 0%, hsl(245, 38%, 22%) 100%)',
    textColor: 'hsl(245, 35%, 85%)',
    patternType: 'diamond',
  },
  'Radiating Fan': {
    hue: 45,
    accent: 'hsl(45, 65%, 52%)',
    bgGradient: 'linear-gradient(135deg, hsl(45, 30%, 13%) 0%, hsl(45, 42%, 20%) 100%)',
    textColor: 'hsl(45, 40%, 85%)',
    patternType: 'radial',
  },
  'Architectural Columns': {
    hue: 180,
    accent: 'hsl(180, 40%, 48%)',
    bgGradient: 'linear-gradient(135deg, hsl(180, 22%, 13%) 0%, hsl(180, 32%, 20%) 100%)',
    textColor: 'hsl(180, 32%, 85%)',
    patternType: 'grid',
  },
  'Fortification Crenellations': {
    hue: 30,
    accent: 'hsl(30, 45%, 45%)',
    bgGradient: 'linear-gradient(135deg, hsl(30, 22%, 13%) 0%, hsl(30, 32%, 20%) 100%)',
    textColor: 'hsl(30, 32%, 85%)',
    patternType: 'steps',
  },
};

/**
 * Fallback style for any unrecognized categories
 */
export const DEFAULT_CATEGORY_STYLE: CategoryStyle = {
  hue: 0,
  accent: 'hsl(0, 0%, 50%)',
  bgGradient: 'linear-gradient(135deg, hsl(0, 0%, 14%) 0%, hsl(0, 0%, 22%) 100%)',
  textColor: 'hsl(0, 0%, 85%)',
  patternType: 'grid',
};

export function getCategoryStyle(category: string): CategoryStyle {
  return CATEGORY_STYLES[category] ?? DEFAULT_CATEGORY_STYLE;
}
