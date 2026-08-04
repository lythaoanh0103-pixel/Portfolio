"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { atmospheres, playlist, playerUi, type AtmosphereId } from "@/lib/atmosphere"
import { emitRipple } from "@/lib/ocean-events"
import type { Lang } from "@/lib/content"

const ease = [0.22, 0.61, 0.36, 1] as const

function fmt(sec: number) {
  if (!isFinite(sec) || sec < 0) sec = 0
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

/* --- tiny inline glyphs (never emojis) ----------------------------------- */
const Icon = {
  play: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
      <path d="M8 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 8 5.5Z" />
    </svg>
  ),
  pause: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
      <rect x="6" y="5" width="4" height="14" rx="1.4" />
      <rect x="14" y="5" width="4" height="14" rx="1.4" />
    </svg>
  ),
  prev: (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
      <path d="M7 5.5v13a1 1 0 0 0 2 0v-5l9 5.4a1 1 0 0 0 1.5-.87V6a1 1 0 0 0-1.5-.87L9 10.5v-5a1 1 0 0 0-2 0Z" />
    </svg>
  ),
  next: (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
      <path d="M17 5.5v13a1 1 0 0 1-2 0v-5l-9 5.4A1 1 0 0 1 4.5 18V6a1 1 0 0 1 1.5-.87L15 10.5v-5a1 1 0 0 1 2 0Z" />
    </svg>
  ),
  note: (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 18V6l10-2v12" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="16" cy="16" r="3" />
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
}

/**
 * The floating glass music player.
 *
 * A single fixed playlist — Flower Day → Uri no Uta → Golden Hour — plays on
 * loop, starting only once `autoplay` turns true (after "Begin Journey").
 * Each song carries the world whose palette it belongs to; while a song is
 * playing, the whole environment (ocean canvas + every glass surface) eases
 * toward that world's colours over a couple of seconds, so the water's mood
 * always follows the music. Picking a track from the list jumps straight to
 * it and its world, with the same soft crossfade.
 *
 * Real audio degrades gracefully — if a track file is missing, a gentle timer
 * drives the progress bar so the interface never feels broken.
 */
export function MusicPlayer({
  world,
  setWorld,
  lang,
  visible,
  autoplay,
}: {
  world: AtmosphereId
  setWorld: (id: AtmosphereId) => void
  lang: Lang
  visible: boolean
  autoplay: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const [track, setTrack] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0) // 0..1
  const [volume, setVolume] = useState(0.7)
  const [hasFile, setHasFile] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const rafRef = useRef(0)
  const fakeElapsed = useRef(0)
  const lastTs = useRef(0)
  const targetVol = useRef(0.7)

  const current = playlist[track] ?? playlist[0]
  const duration = hasFile && audioRef.current && isFinite(audioRef.current.duration) ? audioRef.current.duration : current.seconds

  /* The environment follows the music, not the other way around: once
     playback has actually started, keep the world in sync with whichever
     song is current. (Gated on `playing` so the pre-dive Hero keeps its own
     default world until the journey — and the music — actually begins.) */
  useEffect(() => {
    if (playing && current.world !== world) setWorld(current.world)
  }, [playing, current.world, world, setWorld])

  /* Load / swap the audio source when the track changes. */
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    setHasFile(false)
    a.src = current.src
    a.load()
    if (playing) {
      a.volume = 0
      targetVol.current = volume
      a.play().then(() => setHasFile(true)).catch(() => setHasFile(false))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.src])

  /* Autoplay once, after the dive — never before the first interaction. */
  useEffect(() => {
    if (autoplay && !playing) {
      setPlaying(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay])

  /* Reflect play/pause onto the audio element. Handles the browser autoplay
     restriction gracefully: if `play()` is rejected (no user gesture yet),
     `hasFile` simply stays false and the UI still shows "playing" so the
     very next interaction (or the dive's own click) can retry cleanly. */
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    if (playing) {
      a.volume = 0
      targetVol.current = volume
      a.play().then(() => setHasFile(true)).catch(() => setHasFile(false))
    } else {
      a.pause()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing])

  const next = useCallback(() => {
    setTrack((t) => (t + 1) % playlist.length)
    fakeElapsed.current = 0
    setProgress(0)
  }, [])

  const prev = useCallback(() => {
    setTrack((t) => (t - 1 + playlist.length) % playlist.length)
    fakeElapsed.current = 0
    setProgress(0)
  }, [])

  /* The heartbeat: advance progress from real audio if present, else a timer.
     Also smoothly ramps the audio volume toward its target (crossfade). */
  useEffect(() => {
    const loop = (ts: number) => {
      rafRef.current = requestAnimationFrame(loop)
      const dt = lastTs.current ? Math.min(64, ts - lastTs.current) : 16
      lastTs.current = ts

      const a = audioRef.current
      if (a) {
        // volume glide
        const gv = playing ? targetVol.current : 0
        a.volume += (gv - a.volume) * Math.min(1, dt / 700)
      }

      if (!playing) return

      if (hasFile && a && isFinite(a.duration) && a.duration > 0) {
        setProgress(a.currentTime / a.duration)
      } else {
        fakeElapsed.current += dt / 1000
        const p = fakeElapsed.current / current.seconds
        if (p >= 1) {
          next()
        } else {
          setProgress(p)
        }
      }
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [playing, hasFile, current.seconds, next])

  const onEnded = () => next()

  const chooseTrack = (index: number, e: React.MouseEvent) => {
    if (index !== track) {
      const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
      emitRipple({ x: r.left + r.width / 2, y: r.top + r.height / 2, strength: 1 })
      setTrack(index)
      fakeElapsed.current = 0
      setProgress(0)
    }
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const p = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))
    setProgress(p)
    fakeElapsed.current = p * current.seconds
    const a = audioRef.current
    if (hasFile && a && isFinite(a.duration)) a.currentTime = p * a.duration
  }

  return (
    <>
      {/* audio element (hidden). Missing files just fail quietly. */}
      <audio ref={audioRef} onEnded={onEnded} preload="none" loop={false} />

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            transition={{ duration: 1, ease }}
            className="fixed bottom-5 right-5 z-40 w-[min(20rem,calc(100vw-2.5rem))]"
          >
            <div
              className="glass overflow-hidden"
              style={{ borderRadius: "1.6rem 2rem 1.7rem 1.9rem / 1.9rem 1.6rem 2rem 1.7rem" }}
            >
              {/* header: now playing + collapse */}
              <button
                type="button"
                data-hover
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                aria-label={expanded ? playerUi.collapse[lang] : playerUi.expand[lang]}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <span
                  aria-hidden
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-accent"
                  style={{ background: "color-mix(in srgb, var(--accent) 14%, transparent)" }}
                >
                  <motion.span
                    animate={playing ? { rotate: 360 } : { rotate: 0 }}
                    transition={playing ? { duration: 9, ease: "linear", repeat: Number.POSITIVE_INFINITY } : { duration: 0.4 }}
                    className="grid place-items-center"
                  >
                    {Icon.note}
                  </motion.span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-sans text-[0.6rem] uppercase tracking-[0.28em] text-accent">
                    {playerUi.nowPlaying[lang]}
                  </span>
                  <span className="block truncate font-serif text-sm font-light leading-tight text-foreground">
                    {current.title[lang]}
                  </span>
                </span>
                <motion.span
                  aria-hidden
                  animate={{ rotate: expanded ? 0 : 180 }}
                  transition={{ duration: 0.5, ease }}
                  className="shrink-0 text-foreground/55"
                >
                  {Icon.chevron}
                </motion.span>
              </button>

              {/* progress bar (always visible) */}
              <div className="px-4 pb-3">
                <div
                  role="slider"
                  aria-label={current.title[lang]}
                  aria-valuenow={Math.round(progress * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  tabIndex={0}
                  data-hover
                  onClick={seek}
                  className="group relative h-1.5 w-full cursor-pointer rounded-full"
                  style={{ background: "color-mix(in srgb, var(--foreground) 14%, transparent)" }}
                >
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-accent"
                    style={{ width: `${progress * 100}%` }}
                  />
                  <span
                    className="absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full bg-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ left: `${progress * 100}%`, boxShadow: "0 0 10px 2px color-mix(in srgb, var(--accent) 60%, transparent)" }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between font-sans text-[0.58rem] tabular-nums text-muted-foreground">
                  <span>{fmt(progress * duration)}</span>
                  <span>{fmt(duration)}</span>
                </div>
              </div>

              {/* expandable: transport + worlds */}
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      {/* transport */}
                      <div className="flex items-center justify-center gap-5 py-1">
                        <button
                          type="button"
                          data-hover
                          onClick={prev}
                          aria-label={playerUi.prev[lang]}
                          className="text-foreground/70 transition-colors hover:text-foreground"
                        >
                          {Icon.prev}
                        </button>
                        <button
                          type="button"
                          data-hover
                          onClick={() => setPlaying((p) => !p)}
                          aria-label={playing ? playerUi.pause[lang] : playerUi.play[lang]}
                          className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95"
                          style={{ boxShadow: "0 6px 20px color-mix(in srgb, var(--primary) 45%, transparent)" }}
                        >
                          {playing ? Icon.pause : Icon.play}
                        </button>
                        <button
                          type="button"
                          data-hover
                          onClick={next}
                          aria-label={playerUi.next[lang]}
                          className="text-foreground/70 transition-colors hover:text-foreground"
                        >
                          {Icon.next}
                        </button>
                      </div>

                      {/* volume */}
                      <label className="mt-2 flex items-center gap-2">
                        <span className="sr-only">{playerUi.volume[lang]}</span>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="text-muted-foreground">
                          <path d="M4 9v6h4l5 4V5L8 9H4z" />
                          <path d="M16.5 8.5a5 5 0 0 1 0 7" />
                        </svg>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={volume}
                          data-hover
                          onChange={(e) => {
                            const v = Number(e.target.value)
                            setVolume(v)
                            targetVol.current = v
                          }}
                          aria-label={playerUi.volume[lang]}
                          className="ocean-range h-1 w-full cursor-pointer appearance-none rounded-full"
                          style={{
                            background: `linear-gradient(to right, var(--accent) ${volume * 100}%, color-mix(in srgb, var(--foreground) 14%, transparent) ${volume * 100}%)`,
                          }}
                        />
                      </label>

                      {/* playlist */}
                      <p className="mb-2 mt-4 font-sans text-[0.55rem] uppercase tracking-[0.32em] text-muted-foreground">
                        {playerUi.playlist[lang]}
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {playlist.map((t, i) => {
                          const a = atmospheres[t.world]
                          const activeTrack = i === track
                          return (
                            <button
                              key={t.src}
                              type="button"
                              data-hover
                              onClick={(e) => chooseTrack(i, e)}
                              aria-pressed={activeTrack}
                              className={`flex items-center gap-3 rounded-2xl px-3 py-2 text-left transition-colors duration-500 ${
                                activeTrack ? "glass-soft" : "hover:bg-secondary/40"
                              }`}
                            >
                              <span
                                aria-hidden
                                className="h-4 w-4 shrink-0 rounded-full"
                                style={{
                                  background: `linear-gradient(135deg, rgb(${a.palette.top.join(",")}), rgb(${a.palette.bottom.join(",")}))`,
                                  boxShadow: activeTrack
                                    ? `0 0 12px 2px rgb(${a.palette.accent.join(",")} / 0.7)`
                                    : "none",
                                  border: "1px solid color-mix(in srgb, #ffffff 40%, transparent)",
                                }}
                              />
                              <span className="min-w-0 flex-1">
                                <span
                                  className={`block truncate font-serif text-sm leading-tight ${
                                    activeTrack ? "text-foreground" : "text-foreground/70"
                                  }`}
                                >
                                  {t.title[lang]}
                                </span>
                                <span className="block truncate font-sans text-[0.62rem] font-light leading-snug text-muted-foreground">
                                  {t.note[lang]}
                                </span>
                              </span>
                              {activeTrack && (
                                <motion.span
                                  layoutId="world-dot"
                                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                                  style={{ boxShadow: "0 0 8px 2px color-mix(in srgb, var(--accent) 70%, transparent)" }}
                                />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
