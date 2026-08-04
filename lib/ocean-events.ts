/**
 * A whisper-thin event bus so small interactions (a shell opening, a bottle
 * being uncorked) can send a ripple into the shared ocean canvas without
 * prop-drilling or re-rendering the scene.
 */

export type Ripple = { x: number; y: number; strength: number }

type Listener = (r: Ripple) => void

const listeners = new Set<Listener>()

export function onRipple(fn: Listener) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function emitRipple(r: Ripple) {
  for (const fn of listeners) fn(r)
}
