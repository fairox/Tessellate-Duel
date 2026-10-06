import type { BlockCard } from '../data/blocks';

/**
 * Card art paths. The master PNG plates in /public/cards are the source of
 * truth; scripts/build_card_assets.py derives the lighter WebP display copies
 * and the foil masks used by the holo layer.
 */
const BASE = import.meta.env.BASE_URL;

export const cardFront = (id: number) => `${BASE}cards/web/${id}_front.webp`;
export const cardBack = (id: number) => `${BASE}cards/web/${id}_back.webp`;
export const foilMask = (id: number) => `${BASE}cards/foil/${id}.webp`;

/**
 * CSS value for the --foil-mask custom property. Absolute on purpose: a url()
 * inside a custom property resolves against the stylesheet that reads it, not
 * the page, so a relative path would point into /assets/.
 */
export const foilMaskCss = (id: number) =>
  `url("${new URL(foilMask(id), document.baseURI).href}")`;

export const TOTAL_PLATES = 40;

export type HoloTier = 'common' | 'rare' | 'limited';

/** Rarity drives the finish: matte paper, gold foil, or full prismatic foil. */
export function holoTier(card: Pick<BlockCard, 'rarity'>): HoloTier {
  if (card.rarity >= 5) return 'limited';
  if (card.rarity >= 3) return 'rare';
  return 'common';
}

export const TIER_LABEL: Record<HoloTier, string> = {
  common: 'Matte Print',
  rare: 'Gold Foil',
  limited: 'Prismatic Foil',
};

/** Archive serial in the plate's own numbering style, e.g. "07 / 40". */
export const archiveSerial = (id: number) =>
  `${String(id).padStart(2, '0')} / ${TOTAL_PLATES}`;

/** Every image the table can show, so flips never reveal a blank face. */
export function allCardAssetUrls(cards: BlockCard[]): string[] {
  return cards.flatMap((c) => [cardFront(c.id), cardBack(c.id), foilMask(c.id)]);
}

export function preloadImages(
  urls: string[],
  onProgress: (loaded: number, total: number) => void,
): Promise<void> {
  let loaded = 0;
  const total = urls.length;
  onProgress(0, total);
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.decoding = 'async';
          const done = () => {
            loaded += 1;
            onProgress(loaded, total);
            resolve();
          };
          img.onload = () => {
            // decode() keeps the first flip from stalling on image decode
            img.decode().catch(() => undefined).finally(done);
          };
          img.onerror = done; // a missing plate must never block the table
          img.src = url;
        }),
    ),
  ).then(() => undefined);
}
