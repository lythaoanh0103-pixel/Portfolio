"use client"

import { useEffect } from "react"
import { motion } from "motion/react"
import { ui, type Lang } from "@/lib/content"

const ease = [0.22, 0.61, 0.36, 1] as const

/**
 * The cinematic ~4s dive that plays after "Begin Journey":
 *
 *   surface → a fullscreen wave rolls up → the whole frame sinks underwater
 *   (deep blue, drifting bubbles, a bright caustic ceiling above) → the line
 *   "Every tide carries a story." surfaces and fades → a slow wash reveals the
 *   portfolio beneath.
 *
 * It sits above everything while it runs, then removes itself and calls
 * `onDone` so the page can settle into the depths.
 */
export function DiveTransition({ lang, onDone }: { lang: Lang; onDone: () => void }) {
  useEffect(() => {
    const id = window.setTimeout(onDone, 4200)
    return () => window.clearTimeout(id)
  }, [onDone])

  // A handful of rising bubbles, deterministic-ish for a calm composition.
  const bubbles = Array.from({ length: 22 }, (_, i) => ({
    left: (i * 37) % 100,
    size: 4 + ((i * 13) % 22),
    delay: (i % 10) * 0.18,
    dur: 2.4 + ((i * 7) % 18) / 10,
  }))

  return (
    <motion.div
      className="fixed inset-0 z-[120] overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* The wave that rolls up and swallows the screen */}
      <motion.div
        className="absolute inset-x-0 bottom-0"
        initial={{ height: "0%" }}
        animate={{ height: ["0%", "120%", "120%", "120%"] }}
        transition={{ duration: 4.2, ease, times: [0, 0.32, 0.8, 1] }}
        style={{
          background:
            "linear-gradient(180deg, #7cafd3 0%, #4f8fc0 22%, #2f6592 55%, #163a5f 100%)",
        }}
      >
        {/* foamy crest at the top of the rising wave */}
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-24 -translate-y-1/2 opacity-80 blur-md"
          style={{
            background:
              "radial-gradient(60% 100% at 50% 100%, rgba(247,251,253,0.9), transparent 70%)",
          }}
        />
      </motion.div>

      {/* Bright caustic ceiling of light, seen from below once submerged */}
      <motion.div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0.55, 0.35] }}
        transition={{ duration: 4.2, ease, times: [0, 0.3, 0.55, 1] }}
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, rgba(255,249,232,0.6), rgba(168,213,242,0.25) 45%, transparent 75%)",
        }}
      />

      {/* Rising bubbles during the underwater beat */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 1, 0.6] }}
        transition={{ duration: 4.2, times: [0, 0.32, 0.6, 1], ease }}
      >
        {bubbles.map((b, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${b.left}%`,
              bottom: "-6%",
              width: b.size,
              height: b.size,
              background:
                "radial-gradient(circle at 32% 30%, rgba(255,255,255,0.9), rgba(203,229,247,0.35) 55%, transparent 75%)",
              boxShadow: "0 0 10px rgba(247,251,253,0.5)",
            }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: "-110vh", opacity: [0, 0.9, 0] }}
            transition={{
              duration: b.dur,
              delay: 1.4 + b.delay,
              ease: "easeIn",
              repeat: 1,
              repeatDelay: 0,
            }}
          />
        ))}
      </motion.div>

      {/* The tide caption, surfacing and fading */}
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <motion.p
          className="max-w-xl text-center font-serif text-2xl font-light italic leading-relaxed text-[#f7fbfd] text-pretty sm:text-4xl"
          style={{ textShadow: "0 2px 40px rgba(22,58,95,0.6)" }}
          initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
          animate={{ opacity: [0, 1, 1, 0], y: [24, 0, 0, -18], filter: ["blur(10px)", "blur(0px)", "blur(0px)", "blur(8px)"] }}
          transition={{ duration: 4.2, ease, times: [0, 0.45, 0.78, 1] }}
        >
          {ui.tideCaption[lang]}
        </motion.p>
      </div>

      {/* Final slow wash that lifts to reveal the portfolio beneath */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "#163a5f" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0, 0] }}
        transition={{ duration: 4.2 }}
      />
    </motion.div>
  )
}
