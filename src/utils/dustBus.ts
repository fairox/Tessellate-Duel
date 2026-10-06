/** Tiny bridge so any component can kick pigment dust off the DustField canvas. */
export type BurstFn = (x: number, y: number, strength?: number) => void;

let emitter: BurstFn | null = null;

export function setDustEmitter(fn: BurstFn | null) {
  emitter = fn;
}

/** Fire a pigment burst at viewport coordinates. No-op if the field isn't mounted. */
export function dustBurst(x: number, y: number, strength = 1) {
  emitter?.(x, y, strength);
}
