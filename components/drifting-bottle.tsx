"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { bottleNotes, secretsUi, ui, type Lang } from "@/lib/content"
import { emitRipple } from "@/lib/ocean-events"

const ease = [0.22, 0.61, 0.36, 1] as const

/** Randomly, and rarely, a corked bottle drifts across the water. */
export function DriftingBottle({ active, lang }: { active: boolean; lang: Lang }) {
  const [voyage, setVoyage] = useState<{
    id: number
    dir: 1 | -1
    lane: number
    tilt: number
    duration: number
  } | null>(null)
  const [note, setNote] = useState<number | null>(null)
  const timer = useRef<number | null>(null)
  const seen = useRef(0)

  const clear = () => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = null
  }

  // Schedule the next drift-by: soon-ish the first time, then patiently.
  const schedule = useCallback(() => {
    clear()
    const wait = seen.current === 0 ? 11000 : 26000 + Math.random() * 26000
    timer.current = window.setTimeout(() => {
      seen.current += 1
      setVoyage({
        id: Date.now(),
        dir: Math.random() > 0.5 ? 1 : -1,
        lane: 26 + Math.random() * 46,
        tilt: -14 + Math.random() * 28,
        duration: 30 + Math.random() * 14,
      })
    }, wait)
  }, [])

  useEffect(() => {
    if (!active) {
      clear()
      setVoyage(null)
      return
    }
    schedule()
    return clear
  }, [active, schedule])

  const open = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    emitRipple({ x: r.left + r.width / 2, y: r.top + r.height / 2, strength: 1 })
    setNote(Math.floor(Math.random() * bottleNotes.length))
    setVoyage(null)
    schedule()
  }

  const drifted = () => {
    setVoyage(null)
    schedule()
  }

  const n = note === null ? null : bottleNotes[note]

  return (
    <>
      <AnimatePresence>
        {active && voyage && (
          <motion.div
            key={voyage.id}
            className="pointer-events-none fixed z-[26]"
            style={{ top: `${voyage.lane}%` }}
            initial={{ x: voyage.dir === 1 ? "-14vw" : "108vw", opacity: 0 }}
            animate={{ x: voyage.dir === 1 ? "108vw" : "-14vw", opacity: [0, 1, 1, 0] }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              duration: voyage.duration,
              ease: "linear",
              opacity: { duration: voyage.duration, times: [0, 0.08, 0.9, 1], ease: "linear" },
            }}
            onAnimationComplete={drifted}
          >
            <motion.div
              animate={{ y: [0, -13, 0, 9, 0], rotate: [voyage.tilt - 5, voyage.tilt + 6, voyage.tilt - 5] }}
              transition={{ duration: 7.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            >
              <button
                type="button"
                onClick={open}
                data-hover
                aria-label={secretsUi.bottleLabel[lang]}
                className="pointer-events-auto group relative block outline-none"
              >
                <span
                  aria-hidden
                  className="absolute -inset-6 -z-10 rounded-full opacity-70 blur-xl transition-opacity duration-700 group-hover:opacity-100"
                  style={{ background: "radial-gradient(circle, rgba(201,174,114,0.45), transparent 70%)" }}
                />
                <svg
                  width="62"
                  height="34"
                  viewBox="0 0 62 34"
                  fill="none"
                  aria-hidden
                  className="drop-glow transition-transform duration-500 group-hover:scale-110"
                >
                  {/* cork */}
                  <rect x="1" y="12" width="7" height="10" rx="2" fill="#c9ae72" opacity="0.9" />
                  {/* neck */}
                  <rect x="7" y="13" width="8" height="8" rx="2" fill="#fbf7ef" opacity="0.55" />
                  {/* body */}
                  <path
                    d="M15 12c0-1.5 1-2.4 3-2.6 8-.9 26-1 34 .2 6 .9 8.6 3.4 8.6 7.4s-2.6 6.5-8.6 7.4c-8 1.2-26 1.1-34 .2-2-.2-3-1.1-3-2.6V12Z"
                    fill="#fbf7ef"
                    opacity="0.5"
                  />
                  <path
                    d="M15 12c0-1.5 1-2.4 3-2.6 8-.9 26-1 34 .2 6 .9 8.6 3.4 8.6 7.4s-2.6 6.5-8.6 7.4c-8 1.2-26 1.1-34 .2-2-.2-3-1.1-3-2.6V12Z"
                    stroke="#fbf7ef"
                    strokeWidth="1.1"
                    opacity="0.85"
                  />
                  {/* rolled note inside */}
                  <rect x="24" y="13" width="22" height="7" rx="3.5" fill="#c9ae72" opacity="0.75" />
                  {/* glass highlight */}
                  <path d="M20 12.5c6-.7 18-.8 26 0" stroke="#ffffff" strokeWidth="1.2" opacity="0.75" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {n && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <motion.div
              className="absolute inset-0 bg-[#2c4b68]/25 backdrop-blur-md"
              onClick={() => setNote(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={secretsUi.bottleTitle[lang]}
              initial={{ opacity: 0, scale: 0.92, y: 24, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.95, y: 16, filter: "blur(8px)" }}
              transition={{ duration: 0.7, ease }}
              className="glass-lux relative z-10 w-full max-w-md px-8 py-9 text-center sm:px-11 sm:py-11"
              style={{ borderRadius: "2.2rem 3rem 2.4rem 2.8rem / 2.8rem 2.2rem 3rem 2.4rem" }}
            >
              <p className="mb-5 font-sans text-[0.55rem] uppercase tracking-[0.4em] text-accent">
                {secretsUi.bottleTitle[lang]}
              </p>
              <p className="font-serif text-xl font-light italic leading-relaxed text-foreground text-pretty sm:text-2xl">
                {n.line[lang]}
              </p>
              <p className="mt-5 font-sans text-[0.62rem] font-light tracking-[0.14em] text-muted-foreground">
                — {n.from[lang]}
              </p>
              <button
                type="button"
                onClick={() => setNote(null)}
                data-hover
                className="glass-soft mt-8 rounded-full px-6 py-2.5 font-sans text-[0.62rem] uppercase tracking-[0.24em] text-foreground/80 transition hover:text-accent"
              >
                {ui.close[lang]}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
