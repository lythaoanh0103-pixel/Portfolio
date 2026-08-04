"use client"

import { useEffect, useRef, useState } from "react"

/**
 * A luminous "pearl" that follows the pointer, trailed by a lagging halo ring.
 * On hoverable targets the ring becomes magnetic — it eases toward the element's
 * center and swells — and the pearl brightens. A sparkling trail drifts behind,
 * tinted to the active world via the --cursor-spark CSS variable.
 * Disabled on touch / coarse pointers and under reduced-motion.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null)
  const ringRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!fine || reduce) return
    setEnabled(true)
    document.documentElement.classList.add("no-cursor")

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const ring = { x: pos.x, y: pos.y }
    // Magnetic anchor — where the ring wants to settle (element center when hovering).
    const anchor = { x: pos.x, y: pos.y, active: false }
    let hovering = false
    let pressing = false
    let raf = 0

    const readSpark = (): [string, string] => {
      const styles = getComputedStyle(document.documentElement)
      const gold = styles.getPropertyValue("--cursor-spark").trim() || "201,174,114"
      const foam = styles.getPropertyValue("--cursor-foam").trim() || "251,247,239"
      return [gold, foam]
    }
    let [sparkGold, sparkFoam] = readSpark()

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d") ?? null
    let dpr = 1
    type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number; gold: boolean }
    let sparks: Spark[] = []
    let lastEmit = 0

    const resize = () => {
      if (!canvas) return
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = window.innerWidth + "px"
      canvas.style.height = window.innerHeight + "px"
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
      ;[sparkGold, sparkFoam] = readSpark()
    }
    resize()

    const move = (e: PointerEvent) => {
      const dx = e.clientX - pos.x
      const dy = e.clientY - pos.y
      pos.x = e.clientX
      pos.y = e.clientY

      // Move the pearl the instant the event fires, instead of waiting for
      // the next animation frame — removes the one-frame lag that made the
      // cursor feel delayed.
      if (dotRef.current) {
        const ds = pressing ? 0.6 : hovering ? 0.75 : 1
        dotRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) scale(${ds})`
      }

      const target = e.target as HTMLElement | null
      const hit = target?.closest("a,button,[data-hover]") as HTMLElement | null
      hovering = !!hit
      if (hit) {
        const r = hit.getBoundingClientRect()
        // Only snap for compact targets so large panels don't drag the ring around.
        if (r.width < 360 && r.height < 220) {
          anchor.x = r.left + r.width / 2
          anchor.y = r.top + r.height / 2
          anchor.active = true
        } else {
          anchor.active = false
        }
      } else {
        anchor.active = false
      }

      const speed = Math.hypot(dx, dy)
      const now = performance.now()
      if (speed > 1.2 && now - lastEmit > 16) {
        lastEmit = now
        const count = Math.min(3, 1 + Math.floor(speed / 26))
        for (let i = 0; i < count; i++) {
          sparks.push({
            x: e.clientX + (Math.random() - 0.5) * 6,
            y: e.clientY + (Math.random() - 0.5) * 6,
            vx: -dx * 0.02 + (Math.random() - 0.5) * 0.5,
            vy: -dy * 0.02 + (Math.random() - 0.5) * 0.5 + 0.15,
            life: 0,
            max: 700 + Math.random() * 700,
            r: 0.6 + Math.random() * 1.6,
            gold: Math.random() > 0.55,
          })
        }
        if (sparks.length > 160) sparks = sparks.slice(-160)
      }
    }

    const down = () => (pressing = true)
    const up = () => (pressing = false)

    let last = performance.now()
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(48, now - last)
      last = now

      // Magnetic easing: pull toward the element center, otherwise toward pointer.
      const tx = anchor.active ? pos.x * 0.35 + anchor.x * 0.65 : pos.x
      const ty = anchor.active ? pos.y * 0.35 + anchor.y * 0.65 : pos.y
      ring.x += (tx - ring.x) * (anchor.active ? 0.28 : 0.24)
      ring.y += (ty - ring.y) * (anchor.active ? 0.28 : 0.24)

      if (dotRef.current) {
        const ds = pressing ? 0.6 : hovering ? 0.75 : 1
        dotRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) scale(${ds})`
      }
      if (ringRef.current) {
        const s = pressing ? 1.5 : hovering ? 2.3 : 1
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%) scale(${s})`
        ringRef.current.style.opacity = hovering ? "0.95" : "0.5"
      }

      if (ctx) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
        ctx.globalCompositeOperation = "lighter"
        for (let i = sparks.length - 1; i >= 0; i--) {
          const p = sparks[i]
          p.life += dt
          if (p.life >= p.max) {
            sparks.splice(i, 1)
            continue
          }
          p.x += p.vx * dt * 0.06
          p.y += p.vy * dt * 0.06
          const t = p.life / p.max
          const alpha = Math.sin((1 - t) * Math.PI) * 0.7
          const rad = p.r * (1 + t * 1.2)
          const col = p.gold ? sparkGold : sparkFoam
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad * 4)
          g.addColorStop(0, `rgba(${col},${alpha})`)
          g.addColorStop(1, `rgba(${col},0)`)
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(p.x, p.y, rad * 4, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    window.addEventListener("pointermove", move)
    window.addEventListener("pointerdown", down)
    window.addEventListener("pointerup", up)
    window.addEventListener("resize", resize)
    // Re-read palette when the world changes.
    const paletteTimer = window.setInterval(() => {
      ;[sparkGold, sparkFoam] = readSpark()
    }, 1200)
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.clearInterval(paletteTimer)
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerdown", down)
      window.removeEventListener("pointerup", up)
      window.removeEventListener("resize", resize)
      document.documentElement.classList.remove("no-cursor")
    }
  }, [])

  if (!enabled) return null

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9999]">
      <canvas ref={canvasRef} className="fixed inset-0 h-full w-full" />
      <div
        ref={ringRef}
        className="fixed left-0 top-0 h-8 w-8 rounded-full transition-[opacity] duration-300"
        style={{
          border: "1px solid rgba(var(--cursor-spark, 201 174 114), 0.7)",
          boxShadow: "0 0 18px rgba(var(--cursor-glow, 168 213 242), 0.6)",
        }}
      />
      <div
        ref={dotRef}
        className="fixed left-0 top-0 h-2.5 w-2.5 rounded-full transition-[background] duration-500"
        style={{
          background:
            "radial-gradient(circle at 30% 28%, #ffffff 0%, rgba(var(--cursor-foam, 251 247 239), 1) 34%, rgba(var(--cursor-spark, 201 174 114), 1) 100%)",
          boxShadow: "0 0 12px 2px rgba(var(--cursor-foam, 251 247 239), 0.85)",
        }}
      />
    </div>
  )
}
