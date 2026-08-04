"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { secretsUi, shellSecrets, type Lang } from "@/lib/content"
import { emitRipple } from "@/lib/ocean-events"

const ease = [0.22, 0.61, 0.36, 1] as const

/** Shells resting on the seabed — hand-placed so they never crowd the centre. */
const shells = [
  { left: "9%", size: 46, rotate: -12, delay: 0, align: "start" },
  { left: "27%", size: 34, rotate: 8, delay: 0.4, align: "center" },
  { left: "72%", size: 38, rotate: -6, delay: 0.8, align: "center" },
  { left: "90%", size: 44, rotate: 14, delay: 1.2, align: "end" },
] as const

type Spark = { id: number; angle: number; distance: number; size: number; gold: boolean; delay: number }

function Shell({
  index,
  lang,
  visible,
}: {
  index: number
  lang: Lang
  visible: boolean
}) {
  const s = shells[index]
  const [sparks, setSparks] = useState<Spark[]>([])
  const [whisper, setWhisper] = useState<string | null>(null)
  const hideTimer = useRef<number | null>(null)
  const sparkTimer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current)
      if (sparkTimer.current) window.clearTimeout(sparkTimer.current)
    },
    [],
  )

  const openShell = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    emitRipple({ x: r.left + r.width / 2, y: r.top + r.height / 2, strength: 0.8 })

    const seed = Date.now()
    setSparks(
      Array.from({ length: 14 }, (_, i) => ({
        id: seed + i,
        angle: -160 + Math.random() * 140,
        distance: 44 + Math.random() * 78,
        size: 3 + Math.random() * 5,
        gold: Math.random() > 0.45,
        delay: Math.random() * 0.18,
      })),
    )
    setWhisper(shellSecrets[index % shellSecrets.length][lang])

    if (sparkTimer.current) window.clearTimeout(sparkTimer.current)
    sparkTimer.current = window.setTimeout(() => setSparks([]), 2000)
    if (hideTimer.current) window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setWhisper(null), 5600)
  }

  return (
    <motion.div
      className="absolute bottom-3 -translate-x-1/2"
      style={{ left: s.left }}
      initial={{ opacity: 0, y: 18 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      transition={{ duration: 1.4, ease, delay: visible ? 1.4 + s.delay : 0 }}
    >
      {/* glowing particles released from the shell */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2">
        <AnimatePresence>
          {sparks.map((p) => (
            <motion.span
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                background: p.gold
                  ? "radial-gradient(circle at 30% 30%, #fbf7ef, #c9ae72)"
                  : "radial-gradient(circle at 30% 30%, #ffffff, #a8d5f2)",
                boxShadow: p.gold ? "0 0 12px 3px rgba(201,174,114,0.6)" : "0 0 12px 3px rgba(168,213,242,0.7)",
              }}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
              animate={{
                opacity: [0, 0.95, 0],
                x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
                y: Math.sin((p.angle * Math.PI) / 180) * p.distance - 26,
                scale: [0.4, 1, 0.5],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.7, ease: "easeOut", delay: p.delay }}
            />
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {whisper && (
          <motion.p
            role="status"
            initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, filter: "blur(5px)" }}
            transition={{ duration: 0.8, ease }}
            className={`glass-soft absolute bottom-full mb-4 w-52 rounded-2xl px-4 py-3 text-center font-serif text-xs font-light italic leading-relaxed text-foreground/85 ${
              s.align === "start"
                ? "left-0"
                : s.align === "end"
                  ? "right-0"
                  : "left-1/2 -translate-x-1/2"
            }`}
          >
            {whisper}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={openShell}
        data-hover
        aria-label={secretsUi.shellLabel[lang]}
        whileHover={{ scale: 1.14, y: -3 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 240, damping: 18 }}
        className="pointer-events-auto group relative block outline-none"
        style={{ rotate: `${s.rotate}deg` }}
      >
        <span
          aria-hidden
          className="absolute -inset-3 -z-10 rounded-full opacity-0 blur-lg transition-opacity duration-700 group-hover:opacity-100"
          style={{ background: "radial-gradient(circle, rgba(201,174,114,0.5), transparent 70%)" }}
        />
        <svg width={s.size} height={s.size * 0.82} viewBox="0 0 44 36" fill="none" aria-hidden className="drop-glow">
          <path
            d="M22 2c9.4 0 18 8.6 19.6 25.6.3 3.2-1.6 5.4-4.6 5.4H7c-3 0-4.9-2.2-4.6-5.4C4 10.6 12.6 2 22 2Z"
            fill="#fbf7ef"
            opacity="0.55"
          />
          <path
            d="M22 2c9.4 0 18 8.6 19.6 25.6.3 3.2-1.6 5.4-4.6 5.4H7c-3 0-4.9-2.2-4.6-5.4C4 10.6 12.6 2 22 2Z"
            stroke="#c9ae72"
            strokeWidth="1.1"
            opacity="0.75"
          />
          <path d="M22 3v29M14 5.5 9 32M30 5.5 35 32M7.5 12 4 31M36.5 12 40 31" stroke="#c9ae72" strokeWidth="0.9" opacity="0.5" />
        </svg>
      </motion.button>
    </motion.div>
  )
}

/**
 * The seabed. Four shells wait quietly at the bottom of the screen; touching
 * one releases glowing particles, a ripple, and a small whispered secret.
 */
export function Seashells({ visible, lang }: { visible: boolean; lang: Lang }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[26] h-28">
      <p className="sr-only">{secretsUi.seabedHint[lang]}</p>
      {shells.map((_, i) => (
        <Shell key={i} index={i} lang={lang} visible={visible} />
      ))}
    </div>
  )
}
