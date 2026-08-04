"use client"

import { useCallback, useEffect, useState } from "react"
import { atmospheres, type AtmosphereId } from "@/lib/atmosphere"

const STORAGE_KEY = "ocean-reverie:world"

/**
 * Holds the current world and paints its palette onto <html> as CSS variables.
 * Because every surface reads those variables (and globals.css transitions them
 * over ~1.4s), simply changing the world makes the whole environment — glass,
 * text, borders, cursor tint — morph like a slow tide. The OceanCanvas reads
 * the same `world` id to cross-fade its living layers to match.
 */
export function useAtmosphere() {
  const [world, setWorld] = useState<AtmosphereId>("endlessBlue")

  // Restore the remembered world once, on mount.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as AtmosphereId | null
      if (stored && stored in atmospheres) setWorld(stored)
    } catch {}
  }, [])

  // Paint the world's variables onto the document root.
  useEffect(() => {
    const root = document.documentElement
    const css = atmospheres[world].css
    for (const [key, value] of Object.entries(css)) {
      root.style.setProperty(key, value)
    }
    // The night world flips the browser UI + form controls to dark.
    root.style.setProperty("color-scheme", world === "moonlitAbyss" ? "dark" : "light")
  }, [world])

  const change = useCallback((next: AtmosphereId) => {
    setWorld(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {}
  }, [])

  return { world, setWorld: change }
}
