import type { HoloTier } from '../utils/cardAssets';

/**
 * The light layers that sit over a plate's printed face.
 *
 *  - foil:  iridescent (limited) or gold (rare) colour, masked to the plate's
 *           ink so only the linework catches light, like a foil-stamped print
 *  - grain: fine sparkle inside the foil (limited only)
 *  - glare: a soft specular highlight that follows the light on every card
 *
 * All positioning comes from the --holo-* variables written by useHoloTilt.
 */
export function HoloLayers({ tier }: { tier: HoloTier }) {
  return (
    <>
      {tier !== 'common' && <div className="holo__foil" aria-hidden="true" />}
      {tier === 'limited' && <div className="holo__grain" aria-hidden="true" />}
      <div className="holo__glare" aria-hidden="true" />
      {tier === 'limited' && <div className="holo__sweep" aria-hidden="true" />}
    </>
  );
}
