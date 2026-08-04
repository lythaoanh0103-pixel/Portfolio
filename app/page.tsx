"use client"

import { useCallback, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { AnimatePresence } from "motion/react"
import { OceanCanvas } from "@/components/ocean-canvas"
import { WaterDistortion } from "@/components/water-distortion"
import { CustomCursor } from "@/components/custom-cursor"
import { Hero } from "@/components/hero"
import { UnderwaterWorld } from "@/components/underwater-world"
import { GlassWindow } from "@/components/glass-window"
import { FloatingControls } from "@/components/floating-controls"
import { MusicPlayer } from "@/components/music-player"
import { useAtmosphere } from "@/lib/use-atmosphere"
import type { Lang, SectionId } from "@/lib/content"

// Quiet easter eggs + the cinematic dive — loaded only when needed.
const DriftingBottle = dynamic(() => import("@/components/drifting-bottle").then((m) => m.DriftingBottle), {
  ssr: false,
})
const Seashells = dynamic(() => import("@/components/seashells").then((m) => m.Seashells), { ssr: false })
const DiveTransition = dynamic(() => import("@/components/dive-transition").then((m) => m.DiveTransition), {
  ssr: false,
})

const LANG_KEY = "ocean-reverie:lang"

export default function Page() {
  const [lang, setLangState] = useState<Lang>("en")
  const [submerged, setSubmerged] = useState(false)
  const [diving, setDiving] = useState(false)
  const [navReady, setNavReady] = useState(false)
  const [active, setActive] = useState<SectionId | null>(null)
  const { world, setWorld } = useAtmosphere()

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANG_KEY) as Lang | null
      if (stored === "en" || stored === "vi") setLangState(stored)
    } catch {}
  }, [])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      window.localStorage.setItem(LANG_KEY, l)
    } catch {}
  }, [])

  const dive = useCallback(() => {
    setSubmerged(true)
    setDiving(true)
  }, [])

  const surface = useCallback(() => {
    setActive(null)
    setNavReady(false)
    setDiving(false)
    setSubmerged(false)
  }, [])

  const inTheDeep = submerged && navReady && !active

  return (
    <main className="relative min-h-dvh overflow-hidden">
      <OceanCanvas depth={submerged ? 1 : 0} atmosphere={world} />
      <WaterDistortion />
      <CustomCursor />

      <FloatingControls
        lang={lang}
        setLang={setLang}
        submerged={submerged}
        onSurface={surface}
      />

      <AnimatePresence>{!submerged && <Hero key="hero" lang={lang} onBegin={dive} />}</AnimatePresence>

      {/* The cinematic ~4s dive that carries the visitor into the depths */}
      <AnimatePresence>
        {diving && (
          <DiveTransition
            key="dive"
            lang={lang}
            onDone={() => {
              setDiving(false)
              setNavReady(true)
            }}
          />
        )}
      </AnimatePresence>

      <UnderwaterWorld lang={lang} visible={navReady && !active} onOpen={setActive} />

      <GlassWindow active={active} lang={lang} onClose={() => setActive(null)} />

      {/* The floating glass player — also the world-selector. Music begins
          automatically once the dive settles. */}
      <MusicPlayer world={world} setWorld={setWorld} lang={lang} visible={submerged} autoplay={navReady} />

      {/* Hidden interactions — only alive in the depths, never during a reading */}
      {submerged && (
        <>
          <DriftingBottle active={inTheDeep} lang={lang} />
          <Seashells visible={inTheDeep} lang={lang} />
        </>
      )}

      {/* Depths caption — quiet orienting text once submerged */}
      <AnimatePresence>
        {inTheDeep && (
          <div className="pointer-events-none fixed inset-x-0 bottom-8 z-20 flex justify-center px-6 text-center">
            <p className="font-serif text-sm font-light italic text-foreground/55">
              {lang === "en"
                ? "Let a memory drift closer — touch a light to open it."
                : "Hãy để một ký ức trôi lại gần — chạm vào ánh sáng để mở nó ra."}
            </p>
          </div>
        )}
      </AnimatePresence>
    </main>
  )
}
