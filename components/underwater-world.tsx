"use client"

import { useEffect, useMemo, useRef, useState, type ReactElement, type ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"
import { sections, type Lang, type SectionId } from "@/lib/content"

const ease = [0.22, 0.61, 0.36, 1] as const

/** Deterministic pseudo-random stream (mulberry32) — the world's shape never
 *  changes between renders or reloads, only its motion does. */
function makeRng(seed: number) {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/* --- unique, hand-drawn line-art per chapter — never a generic icon glyph --- */
const bubbleArt: Record<SectionId, ReactElement> = {
  about: (
    // a single paper boat setting out
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 27h28l-4 8H14l-4-8Z" />
      <path d="M24 27V9l10 9-10 4" />
      <path d="M6 32c4 2 8 2 12 0s8-2 12 0 8 2 12 0" opacity="0.55" />
    </svg>
  ),
  littleThings: (
    // a single curled leaf beside a small shell
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 34c-6-6-6-16 2-22 8 4 10 14 4 22-2-6-4-9-9-11" />
      <path d="M31 36c5 .6 9-2.4 9-6.6 0-3-2.2-5.2-5.4-5.2-.6-3.6-3.6-6-7-5-3 .8-4.8 4-3.8 7.2-1.8 1-3 2.8-3 4.8 0 3.2 3.4 5.4 7 4.8Z" opacity="0.85" />
    </svg>
  ),
  projects: (
    // a small lighthouse, its light not yet lit
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 40h8M18 40l3-24h6l3 24" />
      <path d="M19 24h10M20.5 16h7" />
      <path d="M23.5 8h1v4h-1z" fill="currentColor" stroke="none" opacity="0.7" />
      <path d="M8 40c8-3 24-3 32 0" opacity="0.55" />
    </svg>
  ),
  skills: (
    // a stack of smooth stones, formed slowly
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="24" cy="34" rx="12" ry="4.4" />
      <ellipse cx="24" cy="26.5" rx="9" ry="3.6" />
      <ellipse cx="24" cy="19.5" rx="6" ry="3" />
      <ellipse cx="24" cy="13.5" rx="3.4" ry="2.2" />
    </svg>
  ),
  experience: (
    // a shoreline of gentle waves and a drifting gull's path
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 30c3-3 6-3 9 0s6 3 9 0 6-3 9 0 6 3 9 0" />
      <path d="M8 37c3-3 6-3 9 0s6 3 9 0 6-3 9 0 6 3 9 0" opacity="0.6" />
      <path d="M14 14c2-2 4-2 6 0M28 11c2-2 4-2 6 0" opacity="0.7" />
    </svg>
  ),
  contact: (
    // a small lantern let loose on the water
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 12c-4 4-6 8-6 11a6 6 0 0 0 12 0c0-3-2-7-6-11Z" />
      <path d="M24 29v6M20 35h8" />
      <path d="M8 38c4-2 8-2 12 0s8 2 12 0 6-2 8 0" opacity="0.55" />
    </svg>
  ),
}

/* --- irregular horizontal rhythm & organic heights, hand-tuned once ------ */
const GAP_VW = [0, 1.5, 1.05, 1.7, 1.1, 1.55] // distance from the previous chapter, in viewport-widths
const Y_FRAC = [0.36, 0.6, 0.24, 0.66, 0.4, 0.5] // vertical placement, fraction of viewport height
const SIZE = [126, 104, 140, 96, 118, 148] // unique size per chapter

export function UnderwaterWorld({
  lang,
  onOpen,
  visible,
}: {
  lang: Lang
  onOpen: (id: SectionId) => void
  visible: boolean
}) {
  const [vw, setVw] = useState(1440)
  const [vh, setVh] = useState(900)
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState(0)

  const bubbleLayerRef = useRef<HTMLDivElement | null>(null)
  const midLayerRef = useRef<HTMLDivElement | null>(null)
  const farLayerRef = useRef<HTMLDivElement | null>(null)
  const nearLayerRef = useRef<HTMLDivElement | null>(null)

  const cameraX = useRef(0)
  const cameraTarget = useRef(0)
  const maxScroll = useRef(0)
  const initialized = useRef(false)

  useEffect(() => {
    const onResize = () => {
      setVw(window.innerWidth)
      setVh(window.innerHeight)
    }
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  /* Chapter x/y positions — organic spacing, computed once per viewport size. */
  const xPositions = useMemo(() => {
    const xs: number[] = []
    let x = vw * 0.26
    for (let i = 0; i < sections.length; i++) {
      if (i > 0) x += GAP_VW[i % GAP_VW.length] * vw
      xs.push(x)
    }
    return xs
  }, [vw])
  const worldWidth = (xPositions[xPositions.length - 1] ?? 0) + vw * 1.1

  useEffect(() => {
    maxScroll.current = Math.max(0, worldWidth - vw)
  }, [worldWidth, vw])

  /* Quiet underwater life, scattered once with a fixed seed so it never
     jumps around between renders. Deliberately modest counts — this should
     read as "populated", not "busy". */
  const life = useMemo(() => {
    const rng = makeRng(1337)
    const width = Math.max(worldWidth, vw * 2)
    const mk = (n: number, yMin: number, yMax: number) =>
      Array.from({ length: n }, () => ({
        x: rng() * width,
        y: yMin + rng() * (yMax - yMin),
        s: 0.7 + rng() * 0.9,
        dur: 10 + rng() * 14,
        delay: -rng() * 20,
        flip: rng() > 0.5,
      }))
    return {
      seagrass: mk(16, 0.72, 0.92),
      coral: mk(9, 0.76, 0.93),
      shells: mk(11, 0.8, 0.95),
      fish: mk(16, 0.14, 0.72),
      jellyfish: mk(6, 0.1, 0.5),
      petals: mk(12, 0.08, 0.85),
      dust: mk(48, 0.05, 0.98),
    }
  }, [worldWidth, vw])

  /* Camera: eased toward a target that wheel / touch nudge — never snapped,
     always free to stop anywhere. Reset only on the first dive so exploring
     a memory and returning doesn't lose the visitor's place. */
  useEffect(() => {
    if (!visible) return
    if (!initialized.current) {
      initialized.current = true
      cameraX.current = 0
      cameraTarget.current = 0
    }

    const nudge = (delta: number, mult: number) => {
      cameraTarget.current = clamp(cameraTarget.current + delta * mult, 0, maxScroll.current)
    }
    const onWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      nudge(delta, 1.1)
    }
    let tx: number | null = null
    let ty: number | null = null
    const onTouchStart = (e: TouchEvent) => {
      tx = e.touches[0]?.clientX ?? null
      ty = e.touches[0]?.clientY ?? null
    }
    const onTouchMove = (e: TouchEvent) => {
      const x = e.touches[0]?.clientX
      const y = e.touches[0]?.clientY
      if (x == null || y == null || tx == null || ty == null) return
      const dx = tx - x
      const dy = ty - y
      nudge(Math.abs(dx) > Math.abs(dy) ? dx : dy, 1.5)
      tx = x
      ty = y
    }

    window.addEventListener("wheel", onWheel, { passive: true })
    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchmove", onTouchMove, { passive: true })
    return () => {
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchmove", onTouchMove)
    }
  }, [visible])

  /* The drift itself — slow, cinematic easing toward the target, applied
     directly to each layer's transform so React never re-renders per frame.
     Different layers ease at different fractions of the camera for real
     parallax depth: far life barely moves, near dust rushes past. */
  useEffect(() => {
    if (!visible) return
    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      cameraX.current += (cameraTarget.current - cameraX.current) * 0.045
      const cx = cameraX.current
      if (bubbleLayerRef.current) bubbleLayerRef.current.style.transform = `translate3d(${-cx}px,0,0)`
      if (midLayerRef.current) midLayerRef.current.style.transform = `translate3d(${-cx * 0.55}px,0,0)`
      if (farLayerRef.current) farLayerRef.current.style.transform = `translate3d(${-cx * 0.2}px,0,0)`
      if (nearLayerRef.current) nearLayerRef.current.style.transform = `translate3d(${-cx * 1.3}px,0,0)`

      // Track which chapter is nearest the viewport centre, for the menu highlight.
      const centre = cx + vw / 2
      let nearest = 0
      let best = Infinity
      for (let i = 0; i < xPositions.length; i++) {
        const d = Math.abs(xPositions[i] - centre)
        if (d < best) {
          best = d
          nearest = i
        }
      }
      setActive((prev) => (prev === nearest ? prev : nearest))
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, vw])

  const glideTo = (i: number) => {
    const target = clamp(xPositions[i] - vw / 2, 0, maxScroll.current)
    cameraTarget.current = target
    setMenuOpen(false)
  }

  if (!visible) return null

  return (
    <div aria-hidden={false} className="fixed inset-0 z-30 overflow-hidden">
      {/* far life — corals & seagrass in the deep background, barely moving */}
      <div ref={farLayerRef} className="pointer-events-none absolute inset-0 will-change-transform">
        {life.coral.map((c, i) => (
          <CoralShape key={i} x={c.x} yFrac={c.y} vh={vh} scale={c.s} dur={c.dur} delay={c.delay} />
        ))}
      </div>

      {/* mid life — seagrass, shells, petals: a little closer, a little faster */}
      <div ref={midLayerRef} className="pointer-events-none absolute inset-0 will-change-transform">
        {life.seagrass.map((g, i) => (
          <SeagrassShape key={i} x={g.x} yFrac={g.y} vh={vh} scale={g.s} dur={g.dur} delay={g.delay} />
        ))}
        {life.shells.map((s, i) => (
          <ShellShape key={i} x={s.x} yFrac={s.y} vh={vh} scale={s.s} dur={s.dur} delay={s.delay} />
        ))}
        {life.petals.map((p, i) => (
          <PetalShape key={i} x={p.x} yFrac={p.y} vh={vh} scale={p.s} dur={p.dur} delay={p.delay} />
        ))}
        {life.fish.map((f, i) => (
          <FishShape key={i} x={f.x} yFrac={f.y} vh={vh} scale={f.s} dur={f.dur} delay={f.delay} flip={f.flip} />
        ))}
        {life.jellyfish.map((j, i) => (
          <GlassJellyfish key={i} x={j.x} yFrac={j.y} vh={vh} scale={j.s} dur={j.dur} delay={j.delay} />
        ))}
      </div>

      {/* the chapters themselves — the true camera reference (parallax x1) */}
      <div ref={bubbleLayerRef} className="pointer-events-none absolute inset-0 will-change-transform">
        {sections.map((s, i) => {
          const size = SIZE[i % SIZE.length]
          const x = xPositions[i]
          const y = Y_FRAC[i % Y_FRAC.length] * vh
          return (
            <MemoryBubble
              key={s.id}
              index={i}
              size={size}
              x={x}
              y={y}
              title={s.title[lang]}
              art={bubbleArt[s.id]}
              onOpen={() => onOpen(s.id)}
            />
          )
        })}
      </div>

      {/* near dust — tiny, fast, closest to the visitor */}
      <div ref={nearLayerRef} className="pointer-events-none absolute inset-0 will-change-transform">
        {life.dust.map((d, i) => (
          <span
            key={i}
            aria-hidden
            className="absolute rounded-full"
            style={{
              left: d.x,
              top: `${d.y * 100}%`,
              width: 1.5 * d.s,
              height: 1.5 * d.s,
              background: "color-mix(in srgb, var(--foreground) 55%, transparent)",
              opacity: 0.18,
              animation: `drift-dust ${d.dur}s ease-in-out infinite`,
              animationDelay: `${d.delay}s`,
            }}
          />
        ))}
      </div>

      {/* collapsible chapter menu */}
      <div className="fixed bottom-5 left-5 z-40">
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 16, filter: "blur(8px)" }}
              transition={{ duration: 0.6, ease }}
              className="glass-lux mb-3 w-[min(19rem,calc(100vw-2.5rem))] overflow-hidden rounded-[1.6rem] p-2"
            >
              {sections.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  data-hover
                  onClick={() => glideTo(i)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors duration-500 ${
                    active === i ? "glass-soft" : "hover:bg-secondary/40"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`h-1.5 w-1.5 shrink-0 rounded-full transition-opacity duration-500 ${active === i ? "bg-accent opacity-100" : "bg-foreground/30 opacity-70"}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate font-serif text-sm leading-tight ${active === i ? "text-foreground" : "text-foreground/70"}`}>
                      {s.title[lang]}
                    </span>
                    <span className="block truncate font-sans text-[0.6rem] font-light leading-snug text-muted-foreground">
                      {s.tagline[lang]}
                    </span>
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          data-hover
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label={sections[active].title[lang]}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 0.3 }}
          className="glass flex items-center gap-2.5 rounded-full py-2.5 pl-3 pr-4"
        >
          <motion.span
            animate={{ rotate: menuOpen ? 45 : 0 }}
            transition={{ duration: 0.5, ease }}
            className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-accent"
            style={{ background: "color-mix(in srgb, var(--accent) 16%, transparent)" }}
          >
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
          </motion.span>
          <span className="font-sans text-[0.62rem] uppercase tracking-[0.28em] text-foreground/75">{sections[active].title[lang]}</span>
        </motion.button>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- bubble */

function MemoryBubble({
  index,
  size,
  x,
  y,
  title,
  art,
  onOpen,
}: {
  index: number
  size: number
  x: number
  y: number
  title: string
  art: ReactElement
  onOpen: () => void
}) {
  // Unique, gentle, near-imperceptible suspension: float, drift, and the
  // faintest rotation — never perfectly still, never busy.
  const floatDur = 15 + (index % 5) * 2.4
  const driftDur = 21 + (index % 4) * 3.1
  const rotDur = 26 + (index % 3) * 4

  return (
    <motion.div
      className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.6, ease, delay: 0.15 + index * 0.12 }}
    >
      <motion.div
        animate={{ y: [0, -10, 0, 7, 0] }}
        transition={{ duration: floatDur, ease: "easeInOut", repeat: Infinity }}
      >
        <motion.div
          animate={{ x: [0, 6, 0, -6, 0] }}
          transition={{ duration: driftDur, ease: "easeInOut", repeat: Infinity }}
        >
          <motion.button
            type="button"
            data-hover
            onClick={onOpen}
            aria-label={title}
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
            animate={{ rotate: [0, 1.4, 0, -1.4, 0] }}
            transition={{ duration: rotDur, ease: "easeInOut", repeat: Infinity }}
            className="group glass-lux relative grid place-items-center rounded-full outline-none"
            style={{
              width: size,
              height: size,
              boxShadow: `0 10px 40px color-mix(in srgb, var(--foreground) 16%, transparent), 0 0 ${18 + (index % 3) * 8}px color-mix(in srgb, var(--accent) ${20 + (index % 4) * 6}%, transparent)`,
            }}
          >
            <motion.span
              aria-hidden
              variants={{ hover: { opacity: 0.9, scale: 1.06 } }}
              initial={{ opacity: 0.45, scale: 1 }}
              className="absolute inset-0 rounded-full"
              style={{ boxShadow: "0 0 30px 6px color-mix(in srgb, var(--accent) 30%, transparent)" }}
            />
            <span
              aria-hidden
              className="relative text-foreground/75 transition-transform duration-500 group-hover:scale-[1.08]"
              style={{ width: size * 0.42, height: size * 0.42 }}
            >
              {art}
            </span>
            <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-sans text-[0.6rem] uppercase tracking-[0.32em] text-foreground/60 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              {title}
            </span>
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

/* -------------------------------------------------------- quiet ocean life */
/* Deliberately simple silhouettes rendered in the current theme's
   foreground colour, so they recolour automatically with each world
   instead of clashing with it. Motion is pure CSS so hundreds of these
   cost almost nothing. */

function LifeAnchor({
  x,
  yFrac,
  vh,
  scale,
  children,
}: {
  x: number
  yFrac: number
  vh: number
  scale: number
  children: ReactNode
}) {
  return (
    <div
      aria-hidden
      className="absolute"
      style={{ left: x, top: yFrac * vh, transform: `scale(${scale})`, transformOrigin: "center" }}
    >
      {children}
    </div>
  )
}

function SeagrassShape({ x, yFrac, vh, scale, dur, delay }: { x: number; yFrac: number; vh: number; scale: number; dur: number; delay: number }) {
  return (
    <LifeAnchor x={x} yFrac={yFrac} vh={vh} scale={scale}>
      <div style={{ animation: `sway ${dur}s ease-in-out infinite`, animationDelay: `${delay}s`, transformOrigin: "bottom center" }}>
        <svg width="26" height="58" viewBox="0 0 26 58" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" className="text-foreground/25">
          <path d="M6 58C2 40 8 24 4 8" />
          <path d="M13 58C11 38 17 22 12 4" />
          <path d="M20 58C18 42 24 26 19 10" />
        </svg>
      </div>
    </LifeAnchor>
  )
}

function CoralShape({ x, yFrac, vh, scale, dur, delay }: { x: number; yFrac: number; vh: number; scale: number; dur: number; delay: number }) {
  return (
    <LifeAnchor x={x} yFrac={yFrac} vh={vh} scale={scale}>
      <div style={{ animation: `sway ${dur * 1.4}s ease-in-out infinite`, animationDelay: `${delay}s`, transformOrigin: "bottom center", opacity: 0.22 }}>
        <svg width="40" height="34" viewBox="0 0 40 34" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" className="text-foreground">
          <path d="M20 34V16" />
          <path d="M20 22c-5-2-7-8-4-13" />
          <path d="M20 18c5-1 8-6 6-11" />
          <path d="M20 26c4-1 7 1 8 5" />
          <path d="M20 27c-4 0-7 2-8 6" />
        </svg>
      </div>
    </LifeAnchor>
  )
}

function ShellShape({ x, yFrac, vh, scale, dur, delay }: { x: number; yFrac: number; vh: number; scale: number; dur: number; delay: number }) {
  return (
    <LifeAnchor x={x} yFrac={yFrac} vh={vh} scale={scale}>
      <div style={{ animation: `pulse-soft ${dur}s ease-in-out infinite`, animationDelay: `${delay}s`, opacity: 0.28 }}>
        <svg width="20" height="16" viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="1" className="text-foreground">
          <path d="M10 2c5 1.5 8 6 8 12H2c0-6 3-10.5 8-12Z" />
          <path d="M10 2v12M6 5.5v8.5M14 5.5v8.5" opacity="0.6" />
        </svg>
      </div>
    </LifeAnchor>
  )
}

function PetalShape({ x, yFrac, vh, scale, dur, delay }: { x: number; yFrac: number; vh: number; scale: number; dur: number; delay: number }) {
  return (
    <LifeAnchor x={x} yFrac={yFrac} vh={vh} scale={scale}>
      <div style={{ animation: `drift-dust ${dur}s ease-in-out infinite`, animationDelay: `${delay}s`, opacity: 0.24 }}>
        <svg width="14" height="18" viewBox="0 0 14 18" className="text-accent">
          <ellipse cx="7" cy="9" rx="6" ry="8.5" fill="currentColor" opacity="0.5" />
        </svg>
      </div>
    </LifeAnchor>
  )
}

function FishShape({
  x,
  yFrac,
  vh,
  scale,
  dur,
  delay,
  flip,
}: {
  x: number
  yFrac: number
  vh: number
  scale: number
  dur: number
  delay: number
  flip: boolean
}) {
  return (
    <LifeAnchor x={x} yFrac={yFrac} vh={vh} scale={scale}>
      <div
        style={{
          animation: `swim ${dur}s ease-in-out infinite`,
          animationDelay: `${delay}s`,
          transform: flip ? "scaleX(-1)" : undefined,
          opacity: 0.2,
        }}
      >
        <svg width="30" height="14" viewBox="0 0 30 14" fill="currentColor" className="text-foreground">
          <path d="M2 7c5-5 15-6 22-2l4 2-4 2c-7 4-17 3-22-2Z" />
          <path d="M24 7 30 2v10l-6-5Z" opacity="0.7" />
        </svg>
      </div>
    </LifeAnchor>
  )
}

function GlassJellyfish({ x, yFrac, vh, scale, dur, delay }: { x: number; yFrac: number; vh: number; scale: number; dur: number; delay: number }) {
  return (
    <LifeAnchor x={x} yFrac={yFrac} vh={vh} scale={scale}>
      <div style={{ animation: `bob ${dur}s ease-in-out infinite`, animationDelay: `${delay}s` }}>
        <div
          aria-hidden
          style={{
            width: 30,
            height: 24,
            borderRadius: "50% 50% 42% 42%",
            background:
              "radial-gradient(120% 100% at 50% 20%, color-mix(in srgb, #ffffff 30%, transparent), transparent 60%), linear-gradient(135deg, color-mix(in srgb, #e9d6e6 22%, transparent), color-mix(in srgb, #d6e6ea 22%, transparent))",
            border: "1px solid color-mix(in srgb, #ffffff 30%, transparent)",
            opacity: 0.28,
          }}
        />
        <div className="flex justify-center gap-[3px] pt-[1px]" style={{ opacity: 0.18 }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block"
              style={{
                width: 1,
                height: 16 + (i % 2) * 5,
                background: "color-mix(in srgb, var(--foreground) 60%, transparent)",
                animation: `sway ${dur * 0.8}s ease-in-out infinite`,
                animationDelay: `${delay + i * 0.4}s`,
              }}
            />
          ))}
        </div>
      </div>
    </LifeAnchor>
  )
}
