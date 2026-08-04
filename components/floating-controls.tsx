"use client"

import { AnimatePresence, motion } from "motion/react"
import { ui, type Lang } from "@/lib/content"

const ease = [0.22, 0.61, 0.36, 1] as const

export function FloatingControls({
  lang,
  setLang,
  submerged,
  onSurface,
}: {
  lang: Lang
  setLang: (l: Lang) => void
  submerged: boolean
  onSurface: () => void
}) {
  return (
    <>
      {/* top-right: language */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease, delay: 1.6 }}
        className="fixed right-5 top-5 z-40 flex items-center gap-3"
      >
        <div className="glass flex items-center rounded-full p-1 font-sans text-xs">
          {(["en", "vi"] as Lang[]).map((l) => (
            <button
              key={l}
              type="button"
              data-hover
              onClick={() => setLang(l)}
              className={`relative rounded-full px-3 py-1.5 uppercase tracking-[0.2em] transition-colors duration-500 ${
                lang === l ? "text-primary-foreground" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {lang === l && (
                <motion.span
                  layoutId="lang-pill"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                />
              )}
              <span className="relative">{l}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* top-left: return to surface (only when submerged) */}
      <AnimatePresence>
        {submerged && (
          <motion.button
            type="button"
            data-hover
            onClick={onSurface}
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 1, ease }}
            className="glass fixed left-5 top-5 z-40 flex items-center gap-2 rounded-full px-4 py-2.5 font-sans text-[0.65rem] uppercase tracking-[0.25em] text-foreground/70 hover:text-foreground"
          >
            <span aria-hidden className="text-sm leading-none">↑</span>
            {ui.surface[lang]}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
