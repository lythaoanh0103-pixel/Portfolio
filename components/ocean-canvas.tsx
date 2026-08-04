"use client"

import { useEffect, useRef } from "react"
import { onRipple } from "@/lib/ocean-events"
import { atmospheres, type Atmosphere, type AtmosphereId } from "@/lib/atmosphere"

type RGB = [number, number, number]

type Sparkle = { x: number; y: number; r: number; phase: number; speed: number; hue: number; drift: number }
type Mote = { x: number; y: number; r: number; vy: number; sway: number; phase: number; a: number }
type Bokeh = { x: number; y: number; r: number; vx: number; vy: number; phase: number; a: number; gold: boolean }
type Fish = {
  x: number
  y: number
  heading: number
  speed: number
  size: number
  phase: number
  wander: number
  gold: boolean
  startle: number
}
type Ring = { x: number; y: number; life: number; max: number; strength: number }
type Bubble = { x: number; y: number; r: number; vy: number; sway: number; phase: number }
type Petal = { x: number; y: number; r: number; vy: number; vx: number; rot: number; vr: number; phase: number }
type Jelly = { x: number; y: number; r: number; vy: number; phase: number; hue: number }
type Star = { x: number; y: number; r: number; phase: number; speed: number }
type Firefly = { x: number; y: number; r: number; phase: number; vx: number; vy: number }
/** A single drifting mote in the far haze layer — slower and softer than the near dust. */
type Haze = { x: number; y: number; r: number; vy: number; sway: number; phase: number; a: number }

/**
 * The living sea. Painted on a single canvas for performance, built as a
 * stack of slow atmospheric layers rather than discrete decorations:
 * a shifting gradient, drifting caustic bands, volumetric light, a far haze
 * of near-invisible dust, near motes, sunlight sparkles, depth fog, and a
 * shy school of fish — plus, layered on top, world-specific life: bubbles,
 * petals, jellyfish, stars, and fireflies.
 *
 * `depth` (0 surface → 1 below the surface) reshapes light and thickens the
 * haze/fog. `atmosphere` chooses the palette and which decorative layers are
 * alive; the whole scene cross-fades between worlds. Wheel / touch scrolling
 * feeds swell into the waves and ripples; ripples emitted elsewhere spread
 * here as rings. Everything moves slowly enough to feel subconscious rather
 * than animated.
 */
export function OceanCanvas({ depth, atmosphere }: { depth: number; atmosphere: AtmosphereId }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const depthTarget = useRef(depth)
  const depthNow = useRef(depth)
  const mouse = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 })
  const swell = useRef(0)
  const rings = useRef<Ring[]>([])

  // The atmosphere is a ref so the long-lived animation loop always reads the
  // current one without re-subscribing. We interpolate palette values toward
  // the target for a slow, cinematic world-change.
  const atmoTarget = useRef<Atmosphere>(atmospheres[atmosphere])
  const paletteNow = useRef({
    top: [...atmospheres[atmosphere].palette.top] as RGB,
    bottom: [...atmospheres[atmosphere].palette.bottom] as RGB,
    accent: [...atmospheres[atmosphere].palette.accent] as RGB,
    particle: [...atmospheres[atmosphere].palette.particle] as RGB,
    ray: [...atmospheres[atmosphere].palette.ray] as RGB,
  })
  const layerBlend = useRef<Record<string, number>>({
    bubbles: 1,
    petals: 0,
    jellyfish: 0,
    stars: 0,
    fog: 0,
    fireflies: 0,
  })

  useEffect(() => {
    depthTarget.current = depth
  }, [depth])

  useEffect(() => {
    atmoTarget.current = atmospheres[atmosphere]
  }, [atmosphere])

  useEffect(
    () =>
      onRipple(({ x, y, strength }) => {
        rings.current.push({ x, y, life: 0, max: 1600 + strength * 500, strength })
        if (rings.current.length > 10) rings.current.shift()
        swell.current = Math.min(1, swell.current + strength * 0.25)
      }),
    [],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let w = 0
    let h = 0
    let dpr = 1
    let sparkles: Sparkle[] = []
    let motes: Mote[] = []
    let bokeh: Bokeh[] = []
    let fish: Fish[] = []
    let bubbles: Bubble[] = []
    let petals: Petal[] = []
    let jellies: Jelly[] = []
    let stars: Star[] = []
    let fireflies: Firefly[] = []
    let haze: Haze[] = []

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = w + "px"
      canvas.style.height = h + "px"
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const sCount = Math.round(Math.min(190, (w * h) / 9000))
      sparkles = Array.from({ length: sCount }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: 0.4 + Math.random() * 1.8,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.1,
        hue: Math.random(),
        drift: (Math.random() - 0.5) * 0.00004,
      }))

      const mCount = Math.round(Math.min(60, (w * h) / 30000))
      motes = Array.from({ length: mCount }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: 0.6 + Math.random() * 2.4,
        vy: 0.00002 + Math.random() * 0.00006,
        sway: 0.4 + Math.random() * 1.2,
        phase: Math.random() * Math.PI * 2,
        a: 0.15 + Math.random() * 0.4,
      }))

      const bCount = Math.round(Math.min(14, (w * h) / 130000))
      bokeh = Array.from({ length: bCount }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: 28 + Math.random() * 70,
        vx: (Math.random() - 0.5) * 0.000018,
        vy: -(0.000006 + Math.random() * 0.000016),
        phase: Math.random() * Math.PI * 2,
        a: 0.05 + Math.random() * 0.09,
        gold: Math.random() > 0.6,
      }))

      const fCount = reduce ? 0 : Math.round(Math.min(9, Math.max(4, (w * h) / 190000)))
      fish = Array.from({ length: fCount }, () => ({
        x: Math.random() * w,
        y: h * (0.18 + Math.random() * 0.7),
        heading: Math.random() * Math.PI * 2,
        speed: 0.018 + Math.random() * 0.022,
        size: 11 + Math.random() * 15,
        phase: Math.random() * Math.PI * 2,
        wander: Math.random() * Math.PI * 2,
        gold: Math.random() > 0.55,
        startle: 0,
      }))

      // Rising bubbles.
      const buCount = reduce ? 0 : Math.round(Math.min(34, (w * h) / 46000))
      bubbles = Array.from({ length: buCount }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: 1.5 + Math.random() * 4.5,
        vy: 0.00004 + Math.random() * 0.00012,
        sway: 0.5 + Math.random() * 1.6,
        phase: Math.random() * Math.PI * 2,
      }))

      // Drifting petals (Silent Reverie).
      const pCount = reduce ? 0 : Math.round(Math.min(26, (w * h) / 60000))
      petals = Array.from({ length: pCount }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: 4 + Math.random() * 6,
        vy: 0.00003 + Math.random() * 0.00006,
        vx: (Math.random() - 0.5) * 0.00006,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.02,
        phase: Math.random() * Math.PI * 2,
      }))

      // Far haze — a second, slower dust layer well behind the near motes,
      // giving the scene real depth without adding any new "objects".
      const hzCount = Math.round(Math.min(46, (w * h) / 24000))
      haze = Array.from({ length: hzCount }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: 1.2 + Math.random() * 3.6,
        vy: 0.000008 + Math.random() * 0.00002,
        sway: 0.15 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        a: 0.04 + Math.random() * 0.09,
      }))

      // Jellyfish (Moonlit Abyss).
      const jCount = reduce ? 0 : Math.round(Math.min(7, (w * h) / 240000))
      jellies = Array.from({ length: jCount }, () => ({
        x: Math.random() * w,
        y: h * (0.25 + Math.random() * 0.6),
        r: 20 + Math.random() * 26,
        vy: -(0.004 + Math.random() * 0.006),
        phase: Math.random() * Math.PI * 2,
        hue: Math.random(),
      }))

      // Stars reflected on the water (Moonlit Abyss).
      const stCount = reduce ? 40 : Math.round(Math.min(140, (w * h) / 12000))
      stars = Array.from({ length: stCount }, () => ({
        x: Math.random(),
        y: Math.random() * 0.55,
        r: 0.4 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 1.2,
      }))

      // Fireflies / glowing motes (Moonlit Abyss).
      const flCount = reduce ? 0 : Math.round(Math.min(24, (w * h) / 70000))
      fireflies = Array.from({ length: flCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1.2 + Math.random() * 2.2,
        phase: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.01,
        vy: (Math.random() - 0.5) * 0.01,
      }))
    }

    const onMove = (e: PointerEvent) => {
      mouse.current.tx = e.clientX / window.innerWidth
      mouse.current.ty = e.clientY / window.innerHeight
    }
    const onWheel = (e: WheelEvent) => {
      swell.current = Math.min(1, swell.current + Math.min(0.22, Math.abs(e.deltaY) * 0.0018))
    }
    let lastTouchY: number | null = null
    const onTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0]?.clientY ?? null
    }
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY
      if (y == null || lastTouchY == null) return
      swell.current = Math.min(1, swell.current + Math.min(0.18, Math.abs(y - lastTouchY) * 0.0035))
      lastTouchY = y
    }

    resize()
    window.addEventListener("resize", resize)
    window.addEventListener("pointermove", onMove)
    window.addEventListener("wheel", onWheel, { passive: true })
    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchmove", onTouchMove, { passive: true })

    const rgb = (c: number[], alpha = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${alpha})`
    const toward = (cur: RGB, tgt: RGB, k: number) => {
      cur[0] += (tgt[0] - cur[0]) * k
      cur[1] += (tgt[1] - cur[1]) * k
      cur[2] += (tgt[2] - cur[2]) * k
    }
    const shade = (c: RGB, t: RGB, d: number): RGB => [
      c[0] + (t[0] - c[0]) * d,
      c[1] + (t[1] - c[1]) * d,
      c[2] + (t[2] - c[2]) * d,
    ]

    const warmWhite: RGB = [251, 247, 239]

    let raf = 0
    let t = 0
    let start = performance.now()

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(48, now - start)
      start = now
      t += reduce ? 0 : dt * 0.001

      depthNow.current += (depthTarget.current - depthNow.current) * 0.03
      const d = depthNow.current

      // Cross-fade palette + layer visibility toward the target atmosphere.
      // Timed to ~2.5s so a song change and its colour shift always read as
      // one smooth, cinematic move rather than a cut.
      const atmo = atmoTarget.current
      const k = 1 - Math.pow(0.05, dt / 2500)
      const pal = paletteNow.current
      toward(pal.top, atmo.palette.top, k)
      toward(pal.bottom, atmo.palette.bottom, k)
      toward(pal.accent, atmo.palette.accent, k)
      toward(pal.particle, atmo.palette.particle, k)
      toward(pal.ray, atmo.palette.ray, k)
      const lb = layerBlend.current
      for (const key of Object.keys(lb)) {
        const target = (atmo.layers as unknown as Record<string, boolean>)[key] ? 1 : 0
        lb[key] += (target - lb[key]) * k
      }

      swell.current *= Math.pow(0.9955, dt)
      const sw = swell.current

      mouse.current.x += (mouse.current.tx - mouse.current.x) * 0.05
      mouse.current.y += (mouse.current.ty - mouse.current.y) * 0.05
      const mx = mouse.current.x - 0.5
      const my = mouse.current.y - 0.5

      const darker: RGB = [pal.top[0] * 0.82, pal.top[1] * 0.85, pal.top[2] * 0.9]
      const top = shade(pal.top, darker, d * 0.5)
      const bot = shade(pal.bottom, [pal.bottom[0] * 0.8, pal.bottom[1] * 0.82, pal.bottom[2] * 0.9], d * 0.5)
      const gold = pal.accent
      const ray = pal.ray

      const g = ctx.createLinearGradient(0, -my * 40 - sw * 22, 0, h - my * 40)
      g.addColorStop(0, rgb(top))
      g.addColorStop(1, rgb(bot))
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)

      // Note: the old volumetric "god ray" beams have been removed entirely —
      // this world reads as crystal-clear glass, not a lit fantasy scene.
      // Light now only arrives through the caustic shimmer below and the
      // faint, colour-true sparkle field further down.

      // Caustic shimmer bands.
      ctx.save()
      ctx.globalCompositeOperation = "lighter"
      const bands = 7
      for (let i = 0; i < bands; i++) {
        const baseY = (h * (i + 0.5)) / bands
        const amp = (10 + i * 3) * (1 + sw * 1.5)
        const alpha = (0.05 + 0.05 * Math.sin(t * 0.5 + i)) * (1 - d * 0.5) * (1 + sw * 0.6)
        ctx.strokeStyle = rgb(i % 2 === 0 ? ray : gold, Math.max(0, alpha))
        ctx.lineWidth = 1.2
        ctx.beginPath()
        for (let x = -20; x <= w + 20; x += 22) {
          const y =
            baseY + Math.sin(x * 0.012 + t * (0.6 + i * 0.05)) * amp + Math.sin(x * 0.03 - t * 0.4) * (amp * 0.4)
          if (x === -20) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
      ctx.restore()

      // Stars reflected near the top (Moonlit Abyss).
      if (lb.stars > 0.01) {
        ctx.save()
        ctx.globalCompositeOperation = "lighter"
        for (const s of stars) {
          s.phase += reduce ? 0 : 0.02 * s.speed
          const tw = 0.4 + 0.6 * Math.sin(s.phase)
          const px = s.x * w + mx * 8
          const py = s.y * h
          const a = Math.max(0, tw) * lb.stars * 0.9
          if (a <= 0.02) continue
          const gr = ctx.createRadialGradient(px, py, 0, px, py, s.r * 5)
          gr.addColorStop(0, rgb(pal.particle, a))
          gr.addColorStop(1, rgb(pal.particle, 0))
          ctx.fillStyle = gr
          ctx.beginPath()
          ctx.arc(px, py, s.r * 5, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }

      // Ripple rings.
      if (rings.current.length) {
        ctx.save()
        ctx.globalCompositeOperation = "lighter"
        for (let i = rings.current.length - 1; i >= 0; i--) {
          const r = rings.current[i]
          r.life += dt
          if (r.life >= r.max) {
            rings.current.splice(i, 1)
            continue
          }
          const p = r.life / r.max
          const radius = 12 + p * (150 + r.strength * 120)
          const alpha = (1 - p) * 0.3 * r.strength
          ctx.strokeStyle = rgb(gold, alpha)
          ctx.lineWidth = 1.4 * (1 - p) + 0.3
          ctx.beginPath()
          ctx.arc(r.x, r.y, radius, 0, Math.PI * 2)
          ctx.stroke()
          ctx.strokeStyle = rgb(ray, alpha * 0.7)
          ctx.beginPath()
          ctx.arc(r.x, r.y, radius * 0.62, 0, Math.PI * 2)
          ctx.stroke()
        }
        ctx.restore()
      }

      // Sparkles.
      ctx.save()
      ctx.globalCompositeOperation = "lighter"
      for (const s of sparkles) {
        s.phase += reduce ? 0 : 0.02 * s.speed
        s.x += s.drift
        if (s.x < 0) s.x = 1
        if (s.x > 1) s.x = 0
        const tw = 0.5 + 0.5 * Math.sin(s.phase)
        const yBias = s.y * (0.7 + d * 0.3)
        const px = s.x * w + mx * (18 + s.r * 8)
        const py = yBias * h + my * (12 + s.r * 6) + Math.sin(s.phase * 0.6) * sw * 10
        const alpha = tw * (0.55 - d * 0.22)
        if (alpha <= 0.02) continue
        const col = s.hue > 0.5 ? pal.particle : gold
        const rad = s.r * (1 + tw * 1.4)
        const gr = ctx.createRadialGradient(px, py, 0, px, py, rad * 4.5)
        gr.addColorStop(0, rgb(col, alpha))
        gr.addColorStop(0.4, rgb(col, alpha * 0.3))
        gr.addColorStop(1, rgb(col, 0))
        ctx.fillStyle = gr
        ctx.beginPath()
        ctx.arc(px, py, rad * 4.5, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()

      // Jellyfish (Moonlit Abyss) — glass sculptures, not glowing lanterns:
      // near-colorless bells with the faintest iridescent edge, low alpha.
      if (lb.jellyfish > 0.01) {
        ctx.save()
        for (const j of jellies) {
          j.phase += 0.02 * dt * 0.06
          j.y += j.vy * (0.6 + d) * dt
          if (j.y < -0.1 * h) {
            j.y = h * 1.08
            j.x = Math.random() * w
          }
          const px = j.x + Math.sin(j.phase) * 16 + mx * 24
          const py = j.y
          const pulse = 0.85 + 0.15 * Math.sin(j.phase * 1.4)
          const r = j.r * pulse
          const a = lb.jellyfish * 0.24
          // Two whisper-thin iridescent tints instead of one saturated hue —
          // like light catching the edge of glass, not a coloured light source.
          const tint: RGB = j.hue > 0.5 ? [214, 224, 232] : [224, 214, 226]
          const gr = ctx.createRadialGradient(px, py, 0, px, py, r * 1.9)
          gr.addColorStop(0, rgb(tint, a))
          gr.addColorStop(0.6, rgb(tint, a * 0.3))
          gr.addColorStop(1, rgb(tint, 0))
          ctx.fillStyle = gr
          ctx.beginPath()
          ctx.arc(px, py, r * 1.9, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = rgb([236, 238, 240], a * 1.4)
          ctx.beginPath()
          ctx.ellipse(px, py, r * 0.7, r * 0.55, 0, Math.PI, 0)
          ctx.fill()
          ctx.strokeStyle = rgb(tint, a * 1.6)
          ctx.lineWidth = 0.9
          for (let ti = -2; ti <= 2; ti++) {
            ctx.beginPath()
            ctx.moveTo(px + ti * r * 0.16, py)
            for (let seg = 1; seg <= 6; seg++) {
              const yy = py + seg * r * 0.28
              const xx = px + ti * r * 0.16 + Math.sin(j.phase * 1.6 + seg * 0.7 + ti) * r * 0.12
              ctx.lineTo(xx, yy)
            }
            ctx.stroke()
          }
        }
        ctx.restore()
      }

      // The school.
      if (fish.length) {
        const pointerX = mouse.current.x * w
        const pointerY = mouse.current.y * h
        ctx.save()
        for (const f of fish) {
          f.wander += 0.0016 * dt
          f.phase += 0.012 * dt
          f.heading += Math.sin(f.wander) * 0.012

          const dx = f.x - pointerX
          const dy = f.y - pointerY
          const dist = Math.hypot(dx, dy)
          if (dist < 190) {
            const flee = Math.atan2(dy, dx)
            let diff = flee - f.heading
            while (diff > Math.PI) diff -= Math.PI * 2
            while (diff < -Math.PI) diff += Math.PI * 2
            const urgency = (1 - dist / 190) ** 2
            f.heading += diff * urgency * 0.09
            f.startle = Math.min(1, f.startle + urgency * 0.06)
          }
          f.startle *= Math.pow(0.995, dt)

          const speed = f.speed * (1 + f.startle * 2.2) * (1 + sw * 0.5)
          f.x += Math.cos(f.heading) * speed * dt
          f.y += Math.sin(f.heading) * speed * dt

          const pad = 90
          if (f.x < pad || f.x > w - pad || f.y < h * 0.12 || f.y > h * 0.94) {
            const toCenter = Math.atan2(h * 0.55 - f.y, w * 0.5 - f.x)
            let diff = toCenter - f.heading
            while (diff > Math.PI) diff -= Math.PI * 2
            while (diff < -Math.PI) diff += Math.PI * 2
            f.heading += diff * 0.02
          }

          const glow = lb.jellyfish // reuse abyss blend as a "night glow" signal
          const col = f.gold ? shade(gold, bot, 0.15) : shade(pal.particle, bot, 0.72)
          const alpha = (0.3 + 0.14 * d + f.startle * 0.12) * (f.gold ? 0.95 : 1)
          const s = f.size
          const wag = Math.sin(f.phase * (1.6 + f.startle * 2)) * 0.4

          ctx.save()
          ctx.translate(f.x, f.y)
          ctx.rotate(f.heading)
          if (glow > 0.2) {
            ctx.globalCompositeOperation = "lighter"
            const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 1.3)
            gr.addColorStop(0, rgb([210, 220, 228], glow * 0.18))
            gr.addColorStop(1, rgb([210, 220, 228], 0))
            ctx.fillStyle = gr
            ctx.beginPath()
            ctx.arc(0, 0, s * 1.6, 0, Math.PI * 2)
            ctx.fill()
            ctx.globalCompositeOperation = "source-over"
          }
          ctx.fillStyle = rgb(col, alpha)
          ctx.beginPath()
          ctx.moveTo(s * 0.9, 0)
          ctx.quadraticCurveTo(s * 0.1, -s * 0.34, -s * 0.5, 0)
          ctx.quadraticCurveTo(s * 0.1, s * 0.34, s * 0.9, 0)
          ctx.fill()
          ctx.beginPath()
          ctx.moveTo(-s * 0.45, 0)
          ctx.lineTo(-s * 0.95, -s * 0.3 + wag * s * 0.3)
          ctx.lineTo(-s * 0.95, s * 0.3 + wag * s * 0.3)
          ctx.closePath()
          ctx.fill()
          ctx.fillStyle = rgb(warmWhite, alpha * 0.8)
          ctx.beginPath()
          ctx.ellipse(s * 0.28, -s * 0.08, s * 0.22, s * 0.05, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
        ctx.restore()
      }

      // Rising bubbles.
      if (lb.bubbles > 0.01 && bubbles.length) {
        ctx.save()
        for (const b of bubbles) {
          b.phase += 0.02 * b.sway
          b.y -= b.vy * (0.6 + d) * dt
          if (b.y < -0.05) {
            b.y = 1.05
            b.x = Math.random()
          }
          const px = b.x * w + Math.sin(b.phase) * 12 + mx * 14
          const py = b.y * h
          // Kept faint and thin-walled — a suggestion of a bubble, not a
          // cartoon outline with a glossy highlight.
          const a = lb.bubbles * (0.12 + d * 0.12)
          ctx.strokeStyle = rgb(pal.particle, a)
          ctx.lineWidth = 0.6
          ctx.beginPath()
          ctx.arc(px, py, b.r, 0, Math.PI * 2)
          ctx.stroke()
        }
        ctx.restore()
      }

      // Drifting petals (Silent Reverie).
      if (lb.petals > 0.01 && petals.length) {
        ctx.save()
        for (const p of petals) {
          p.phase += 0.01 * dt * 0.06
          p.y += p.vy * dt
          p.x += (p.vx + Math.sin(p.phase) * 0.00008) * dt
          p.rot += p.vr * dt * 0.06
          if (p.y > 1.06) {
            p.y = -0.06
            p.x = Math.random()
          }
          if (p.x < -0.05) p.x = 1.05
          if (p.x > 1.05) p.x = -0.05
          const px = p.x * w + mx * 18
          const py = p.y * h
          const a = lb.petals * 0.62
          ctx.save()
          ctx.translate(px, py)
          ctx.rotate(p.rot)
          const col: RGB = [235, 197, 205]
          const gr = ctx.createLinearGradient(0, -p.r, 0, p.r)
          gr.addColorStop(0, rgb([248, 224, 228], a))
          gr.addColorStop(1, rgb(col, a * 0.8))
          ctx.fillStyle = gr
          ctx.beginPath()
          ctx.ellipse(0, 0, p.r * 0.6, p.r, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
        ctx.restore()
      }

      // Fireflies / glowing plankton (Moonlit Abyss).
      if (lb.fireflies > 0.01 && fireflies.length) {
        ctx.save()
        ctx.globalCompositeOperation = "lighter"
        for (const f of fireflies) {
          f.phase += 0.02 * dt * 0.06
          f.x += (f.vx + Math.sin(f.phase) * 0.02) * dt
          f.y += (f.vy + Math.cos(f.phase * 0.8) * 0.02) * dt
          if (f.x < 0) f.x = w
          if (f.x > w) f.x = 0
          if (f.y < 0) f.y = h
          if (f.y > h) f.y = 0
          const tw = 0.4 + 0.6 * Math.sin(f.phase * 2)
          const a = Math.max(0, tw) * lb.fireflies * 0.7
          const gr = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 6)
          gr.addColorStop(0, rgb([180, 214, 244], a))
          gr.addColorStop(1, rgb([180, 214, 244], 0))
          ctx.fillStyle = gr
          ctx.beginPath()
          ctx.arc(f.x, f.y, f.r * 6, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }

      // Far haze — a slow, near-invisible dust layer well behind everything
      // else. This is what makes the water feel thick with distance instead
      // of like an empty box with a few sprites floating in it.
      ctx.save()
      ctx.globalCompositeOperation = "lighter"
      for (const hz of haze) {
        hz.phase += reduce ? 0 : 0.004 * hz.sway
        hz.y -= reduce ? 0 : hz.vy * (0.5 + d) * dt
        if (hz.y < -0.05) hz.y = 1.05
        const px = hz.x * w + Math.sin(hz.phase) * 26 + mx * 6
        const py = hz.y * h
        const a = hz.a * (0.5 + d * 0.5)
        const gr = ctx.createRadialGradient(px, py, 0, px, py, hz.r * 7)
        gr.addColorStop(0, rgb(pal.particle, a))
        gr.addColorStop(1, rgb(pal.particle, 0))
        ctx.fillStyle = gr
        ctx.beginPath()
        ctx.arc(px, py, hz.r * 7, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()

      // Drifting motes.
      ctx.save()
      ctx.globalCompositeOperation = "lighter"
      for (const m of motes) {
        m.phase += reduce ? 0 : 0.01 * m.sway
        m.y -= reduce ? 0 : m.vy * (0.4 + d) * dt
        if (m.y < -0.05) m.y = 1.05
        const px = m.x * w + Math.sin(m.phase) * 18 + mx * 10
        const py = m.y * h
        const a = m.a * (0.4 + d * 0.6)
        const gr = ctx.createRadialGradient(px, py, 0, px, py, m.r * 5)
        gr.addColorStop(0, rgb(pal.particle, a))
        gr.addColorStop(1, rgb(pal.particle, 0))
        ctx.fillStyle = gr
        ctx.beginPath()
        ctx.arc(px, py, m.r * 5, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()

      // Foreground bokeh.
      ctx.save()
      ctx.globalCompositeOperation = "lighter"
      for (const b of bokeh) {
        b.phase += reduce ? 0 : 0.004 * dt * 0.06
        b.x += reduce ? 0 : b.vx * dt
        b.y += reduce ? 0 : b.vy * (0.5 + d) * dt
        if (b.y < -0.15) {
          b.y = 1.15
          b.x = Math.random()
        }
        if (b.x < -0.1) b.x = 1.1
        if (b.x > 1.1) b.x = -0.1
        const px = b.x * w + Math.sin(b.phase) * 14 + mx * (30 + b.r * 0.4)
        const py = b.y * h + my * (18 + b.r * 0.3)
        const pulse = 0.75 + 0.25 * Math.sin(b.phase * 0.7)
        const alpha = b.a * pulse * (0.4 + d * 0.32)
        const col = b.gold ? gold : pal.particle
        const gr = ctx.createRadialGradient(px, py, 0, px, py, b.r)
        gr.addColorStop(0, rgb(col, alpha))
        gr.addColorStop(0.55, rgb(col, alpha * 0.4))
        gr.addColorStop(1, rgb(col, 0))
        ctx.fillStyle = gr
        ctx.beginPath()
        ctx.arc(px, py, b.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()

      // Depth fog — always present at a faint level so the water always
      // reads as a body of water with distance in it, and thickens further
      // in worlds that call for it (Reverie / Abyss) and as the visitor
      // sinks deeper.
      {
        ctx.save()
        const baseFogA = 0.05 + d * 0.05 + lb.fog * 0.12
        const gr = ctx.createLinearGradient(0, h * 0.35, 0, h)
        gr.addColorStop(0, rgb(pal.particle, 0))
        gr.addColorStop(1, rgb(pal.particle, baseFogA))
        ctx.fillStyle = gr
        ctx.fillRect(0, h * 0.35, w, h * 0.65)
        ctx.restore()
      }

      // Soft vignette.
      const vg = ctx.createRadialGradient(w / 2, h * 0.42, h * 0.2, w / 2, h * 0.5, h * 0.9)
      vg.addColorStop(0, "rgba(0,0,0,0)")
      vg.addColorStop(1, rgb(shade(pal.bottom, [0, 0, 0], 0.4), 0.24 + d * 0.14))
      ctx.fillStyle = vg
      ctx.fillRect(0, 0, w, h)
    }

    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchmove", onTouchMove)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-0 h-full w-full" />
}
