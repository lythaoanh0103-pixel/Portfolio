"use client"

import { motion } from "motion/react"
import { ui, type Lang } from "@/lib/content"

const ease = [0.22, 0.61, 0.36, 1] as const

/**
 * The surface — now a mystery rather than an introduction.
 *
 * For the first few seconds the visitor sees only the moving ocean. Then a
 * single faint kicker, the name written as if by sunlight on water, one
 * poetic couplet, and the quiet invitation to begin. No profession, no
 * résumé line — only curiosity.
 */
export function Hero({ lang, onBegin }: { lang: Lang; onBegin: () => void }) {
  // Deliberate, unhurried reveal timeline (seconds).
  const T = {
    kicker: 1.6,
    name: 2.4,
    quote: 4.2,
    button: 5.6,
    hint: 7,
  }

  return (
    <motion.section
      className="relative z-20 flex min-h-dvh flex-col items-center justify-center px-6 text-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -70, scale: 1.07, filter: "blur(8px)" }}
      transition={{ duration: 1.6, ease }}
    >
      {/* faint breathing halo behind the name — like light gathering on water */}
      <motion.span
        aria-hidden
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0, 0.5, 0.32], scale: 1 }}
        transition={{ duration: 5, ease, delay: T.name }}
        className="pointer-events-none absolute h-[36rem] w-[36rem] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--accent) 26%, transparent), transparent 62%)",
        }}
      />

      <motion.p
        initial={{ opacity: 0, y: 14, letterSpacing: "0.35em" }}
        animate={{ opacity: 0.85, y: 0, letterSpacing: "0.6em" }}
        transition={{ duration: 2.4, ease, delay: T.kicker }}
        className="relative mb-8 pl-[0.6em] font-sans text-[0.66rem] uppercase text-accent"
      >
        Ocean Reverie
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 30, filter: "blur(16px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 2.8, ease, delay: T.name }}
        className="sunlight-text relative font-serif text-6xl font-light leading-[1.02] tracking-tight text-balance sm:text-8xl md:text-9xl"
        style={{ textShadow: "0 2px 60px color-mix(in srgb, var(--ring) 45%, transparent)" }}
      >
        {ui.name[lang]}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2.4, ease, delay: T.quote }}
        className="relative mt-10 max-w-md"
      >
        <span
          aria-hidden
          className="mx-auto mb-6 block h-px w-16 bg-gradient-to-r from-transparent via-accent/70 to-transparent"
        />
        <p className="font-serif text-xl font-light italic leading-relaxed text-foreground/75 text-pretty sm:text-2xl">
          {ui.quoteLine1[lang]}
          <br />
          {ui.quoteLine2[lang]}
        </p>
      </motion.div>

      <motion.button
        type="button"
        onClick={onBegin}
        data-hover
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2.2, ease, delay: T.button }}
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.97 }}
        className="glass group relative mt-14 rounded-full px-11 py-4 font-sans text-sm font-light uppercase tracking-[0.22em] text-foreground"
      >
        <span className="relative inline-flex items-center gap-3">
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-accent transition-all duration-700 group-hover:shadow-[0_0_16px_5px_color-mix(in_srgb,var(--accent)_70%,transparent)]"
          />
          {ui.begin[lang]}
        </span>
      </motion.button>

      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.7, 0] }}
        transition={{ duration: 3.6, ease, delay: T.hint, repeat: Number.POSITIVE_INFINITY }}
        className="absolute bottom-10 flex flex-col items-center gap-2 text-muted-foreground"
      >
        <span className="font-sans text-[0.6rem] uppercase tracking-[0.4em]">{ui.scrollHint[lang]}</span>
        <span className="h-8 w-px bg-gradient-to-b from-accent/70 to-transparent" />
      </motion.div>
    </motion.section>
  )
}
