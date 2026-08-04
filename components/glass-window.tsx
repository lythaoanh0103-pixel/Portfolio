"use client"

import { useEffect, useRef } from "react"
import { AnimatePresence, motion } from "motion/react"
import { sections, ui, type Lang, type SectionId } from "@/lib/content"
import { SectionContent } from "@/components/section-content"

const ease = [0.22, 0.61, 0.36, 1] as const

export function GlassWindow({
  active,
  lang,
  onClose,
}: {
  active: SectionId | null
  lang: Lang
  onClose: () => void
}) {
  const section = sections.find((s) => s.id === active)
  const panelRef = useRef<HTMLDivElement | null>(null)

  // Escape to close + focus the panel when it opens.
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    const id = window.setTimeout(() => panelRef.current?.focus(), 60)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.clearTimeout(id)
    }
  }, [active, onClose])

  return (
    <AnimatePresence>
      {active && section && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease }}
        >
          <motion.div
            className="absolute inset-0 bg-[#2c4b68]/25 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={section.title[lang]}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.9, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.94, y: 20, filter: "blur(8px)" }}
            transition={{ duration: 0.75, ease }}
            className="glass-lux relative z-10 w-full max-w-2xl overflow-hidden p-1.5 outline-none"
            style={{
              // irregular, organic outline — softened so content never clips
              borderRadius: "2.6rem 3.6rem 2.8rem 3.4rem / 3.2rem 2.6rem 3.6rem 3rem",
            }}
          >
            {/* drifting inner glints for a "sunlit water" feel */}
            <span
              aria-hidden
              className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full opacity-60 blur-2xl"
              style={{ background: "radial-gradient(circle, rgba(255,255,255,0.7), transparent 70%)" }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-12 -right-8 h-44 w-44 rounded-full opacity-40 blur-2xl"
              style={{ background: "radial-gradient(circle, rgba(201,174,114,0.4), transparent 70%)" }}
            />

            <div
              className="relative max-h-[82dvh] overflow-y-auto px-7 py-8 sm:px-12 sm:py-11"
              style={{ borderRadius: "2.4rem 3.4rem 2.6rem 3.2rem / 3rem 2.4rem 3.4rem 2.8rem" }}
            >
              <div className="mb-7 flex items-start justify-between gap-4">
                <div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, ease, delay: 0.1 }}
                    className="mb-2 font-sans text-[0.6rem] uppercase tracking-[0.4em] text-accent"
                  >
                    {section.title[lang]}
                  </motion.p>
                  <motion.h2
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease, delay: 0.18 }}
                    className="font-serif text-3xl font-light leading-tight text-foreground text-balance sm:text-4xl"
                  >
                    {section.tagline[lang]}
                  </motion.h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  data-hover
                  aria-label={ui.close[lang]}
                  className="glass-soft flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground/70 transition hover:text-foreground"
                >
                  <span aria-hidden className="text-lg leading-none">
                    ×
                  </span>
                </button>
              </div>

              <SectionContent id={section.id} lang={lang} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
