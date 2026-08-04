"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "motion/react"
import { about, contact, experience, littleThings, projects, skills, ui, type Lang, type SectionId } from "@/lib/content"

const ease = [0.22, 0.61, 0.36, 1] as const

function stagger(i: number) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease, delay: 0.15 + i * 0.09 },
  }
}

/* ------------------------------------------------------ Little Things icons */

function TinyIcon({ name }: { name: string }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.3,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  }
  switch (name) {
    case "book":
      return (
        <svg {...common}>
          <path d="M12 6c-1.5-1.2-4-2-7-2v13c3 0 5.5.8 7 2 1.5-1.2 4-2 7-2V4c-3 0-5.5.8-7 2Z" />
          <path d="M12 6v13" />
        </svg>
      )
    case "piano":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M8 5v9M12 5v9M16 5v9M3 14h18" />
        </svg>
      )
    case "wave":
      return (
        <svg {...common}>
          <path d="M2 12c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2" />
          <path d="M2 17c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2" />
        </svg>
      )
    case "sun":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      )
    case "coffee":
      return (
        <svg {...common}>
          <path d="M5 9h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9Z" />
          <path d="M16 10h2a2 2 0 0 1 0 4h-2" />
          <path d="M8 3c-.5.8-.5 1.6 0 2.4M11.5 3c-.5.8-.5 1.6 0 2.4" />
        </svg>
      )
    case "spark":
      return (
        <svg {...common}>
          <path d="M12 3l1.6 4.8L18 9l-4.4 1.2L12 15l-1.6-4.8L6 9l4.4-1.2L12 3Z" />
          <path d="M18 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
        </svg>
      )
    case "leaf":
      return (
        <svg {...common}>
          <path d="M4 20c0-8 6-14 16-14 0 10-6 14-14 14a8 8 0 0 1-2 0Z" />
          <path d="M4 20c4-6 8-8 12-9" />
        </svg>
      )
    case "moon":
      return (
        <svg {...common}>
          <path d="M20 14A8 8 0 0 1 10 4a7 7 0 1 0 10 10Z" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
        </svg>
      )
  }
}

function LittleThings({ lang }: { lang: Lang }) {
  return (
    <div className="space-y-6">
      <motion.p
        {...stagger(0)}
        className="font-serif text-base font-light italic leading-relaxed text-foreground/80 text-pretty"
      >
        {littleThings.intro[lang]}
      </motion.p>
      <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {littleThings.items.map((item, i) => (
          <motion.li
            key={item.icon}
            {...stagger(i + 1)}
            whileHover={{ x: 4 }}
            data-hover
            className="glass-soft group flex items-center gap-3 rounded-2xl px-4 py-3"
          >
            <span
              aria-hidden
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-accent transition-all duration-500 group-hover:shadow-[0_0_14px_2px_color-mix(in_srgb,var(--accent)_55%,transparent)]"
              style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)" }}
            >
              <TinyIcon name={item.icon} />
            </span>
            <span className="font-sans text-sm font-light leading-snug text-foreground/85">{item.text[lang]}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

/* ---------------------------------------------------------------- Skills */

function SkillBubble({ label, i }: { label: string; i: number }) {
  return (
    <motion.button
      type="button"
      data-hover
      {...stagger(i)}
      whileHover={{ scale: 1.07 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className="glass-soft group inline-flex items-center gap-2 rounded-full px-4 py-2 font-sans text-xs font-light tracking-wide text-foreground/85"
    >
      <span
        aria-hidden
        className="h-2 w-2 rounded-full transition-all duration-500 group-hover:shadow-[0_0_12px_3px_rgba(201,174,114,0.7)]"
        style={{
          background: "radial-gradient(circle at 30% 30%, #fbf7ef, #a8d5f2)",
          boxShadow: "0 0 8px rgba(168,213,242,0.9)",
        }}
      />
      {label}
    </motion.button>
  )
}

/* -------------------------------------------------- Project detail popup */

function ProjectDetail({
  index,
  lang,
  onBack,
}: {
  index: number
  lang: Lang
  onBack: () => void
}) {
  const p = projects[index]
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation()
        onBack()
      }
    }
    window.addEventListener("keydown", onKey, true)
    const id = window.setTimeout(() => ref.current?.focus(), 60)
    return () => {
      window.removeEventListener("keydown", onKey, true)
      window.clearTimeout(id)
    }
  }, [onBack])

  return (
    <motion.div
      ref={ref}
      tabIndex={-1}
      initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 16, filter: "blur(6px)" }}
      transition={{ duration: 0.7, ease }}
      className="outline-none"
    >
      <button
        type="button"
        onClick={onBack}
        data-hover
        className="mb-5 inline-flex items-center gap-2 font-sans text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground transition hover:text-foreground"
      >
        <span aria-hidden>←</span>
        {ui.backToProjects[lang]}
      </button>

      {/* single, restrained screenshot — a memory, not a billboard */}
      <div
        className="relative mb-6 h-40 w-full overflow-hidden sm:h-52"
        style={{ borderRadius: "1.6rem 2.2rem 1.8rem 2rem / 2rem 1.6rem 2.2rem 1.8rem" }}
      >
        <Image
          src={p.cover || "/placeholder.svg"}
          alt={p.title[lang]}
          fill
          sizes="(max-width: 640px) 100vw, 620px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/60 via-transparent to-card/10" />
      </div>

      <h3 className="font-serif text-2xl font-light leading-tight text-foreground text-pretty sm:text-3xl">
        {p.title[lang]}
      </h3>
      <p className="mt-1 font-serif text-sm font-light italic text-accent">{p.subtitle[lang]}</p>

      <p className="mt-4 font-sans text-sm font-light leading-relaxed text-foreground/80">{p.detail[lang]}</p>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {p.tech.map((t) => (
          <span
            key={t}
            className="rounded-full bg-secondary/70 px-2.5 py-0.5 font-sans text-[0.6rem] tracking-wide text-secondary-foreground"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <a
          href={p.github}
          target="_blank"
          rel="noreferrer"
          data-hover
          className="glass-soft inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-sans text-[0.7rem] uppercase tracking-[0.2em] text-foreground transition hover:text-accent"
        >
          {ui.viewGithub[lang]}
          <span aria-hidden>→</span>
        </a>
        {p.demo ? (
          <a
            href={p.demo}
            target="_blank"
            rel="noreferrer"
            data-hover
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-sans text-[0.7rem] uppercase tracking-[0.2em] text-primary-foreground transition hover:opacity-90"
          >
            {ui.liveDemo[lang]}
            <span aria-hidden>↗</span>
          </a>
        ) : (
          <span className="font-sans text-[0.65rem] font-light italic text-muted-foreground">
            {ui.liveSoon[lang]}
          </span>
        )}
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------- Projects */

function Projects({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {open === null ? (
          <motion.ul
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease }}
            className="flex flex-col gap-2.5"
          >
            {projects.map((p, i) => (
              <motion.li key={p.title.en} {...stagger(i)}>
                <button
                  type="button"
                  data-hover
                  onClick={() => setOpen(i)}
                  className="group w-full rounded-3xl border border-transparent px-4 py-4 text-left transition-colors duration-500 hover:border-border/60 hover:bg-secondary/25"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-serif text-lg font-light leading-tight text-foreground text-pretty transition-colors duration-500 group-hover:text-accent sm:text-xl">
                      {p.title[lang]}
                    </h3>
                    <span
                      aria-hidden
                      className="shrink-0 font-sans text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground opacity-0 transition-all duration-500 group-hover:opacity-100"
                    >
                      {ui.enter[lang]} →
                    </span>
                  </div>
                  <p className="mt-1 font-sans text-xs font-light leading-relaxed text-foreground/65">
                    {p.description[lang]}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {p.tech.map((t) => (
                      <span
                        key={t}
                        className="font-sans text-[0.6rem] uppercase tracking-[0.15em] text-muted-foreground"
                      >
                        {t}
                        <span aria-hidden className="ml-1.5 text-accent/50">
                          ·
                        </span>
                      </span>
                    ))}
                  </div>
                </button>
              </motion.li>
            ))}
          </motion.ul>
        ) : (
          <ProjectDetail key="detail" index={open} lang={lang} onBack={() => setOpen(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

/* -------------------------------------------------------------- Content */

export function SectionContent({ id, lang }: { id: SectionId; lang: Lang }) {
  if (id === "about") {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr] sm:items-start">
        {/* portrait kept intentionally small and atmospheric */}
        <motion.figure
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease, delay: 0.2 }}
          className="relative mx-auto w-28 shrink-0 sm:mx-0 sm:w-32"
        >
          <div
            className="relative aspect-[4/5] w-full overflow-hidden"
            style={{ borderRadius: "1.4rem 1.8rem 1.5rem 1.7rem / 1.7rem 1.4rem 1.8rem 1.5rem" }}
          >
            <Image
              src="/portrait.jpg"
              alt={ui.aboutPortrait[lang]}
              fill
              sizes="128px"
              className="object-cover"
              style={{ filter: "saturate(0.92) brightness(1.03)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/25 via-transparent to-transparent" />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ boxShadow: "inset 0 0 22px rgba(247,251,253,0.5)" }}
            />
          </div>
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-3 -z-10 rounded-[2rem] opacity-70 blur-xl"
            style={{ background: "radial-gradient(circle, rgba(168,213,242,0.55), transparent 70%)" }}
          />
          <figcaption className="mt-2 text-center font-serif text-[0.65rem] font-light italic text-muted-foreground sm:text-left">
            {ui.aboutPortrait[lang]}
          </figcaption>
        </motion.figure>

        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-2.5">
            {about.meta.map((row, i) => (
              <motion.div key={row.k.en} {...stagger(i)} className="border-l border-accent/40 pl-3">
                <p className="font-sans text-[0.58rem] uppercase tracking-[0.25em] text-accent">{row.k[lang]}</p>
                <p className="mt-0.5 font-serif text-base leading-snug text-foreground">{row.v[lang]}</p>
              </motion.div>
            ))}
          </div>
          <div className="space-y-3">
            {about.note[lang].map((p, i) => (
              <motion.p
                key={i}
                {...stagger(i + 3)}
                className="font-sans text-sm font-light leading-relaxed text-foreground/80"
              >
                {p}
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (id === "littleThings") {
    return <LittleThings lang={lang} />
  }

  if (id === "projects") {
    return <Projects lang={lang} />
  }

  if (id === "skills") {
    return (
      <div className="space-y-6">
        {skills.map((grp, gi) => (
          <div key={grp.group.en}>
            <p className="mb-3 font-sans text-[0.6rem] uppercase tracking-[0.3em] text-accent">{grp.group[lang]}</p>
            <div className="flex flex-wrap gap-2.5">
              {grp.items.map((s, i) => (
                <SkillBubble key={s} label={s} i={gi * 3 + i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (id === "experience") {
    return (
      <ol className="relative space-y-4 pl-6">
        <span
          aria-hidden
          className="absolute bottom-2 left-1.5 top-2 w-px bg-gradient-to-b from-accent/60 via-primary/40 to-transparent"
        />
        {experience.map((e, i) => (
          <motion.li key={e.role.en} {...stagger(i)} className="relative">
            <span
              aria-hidden
              className="absolute -left-[1.35rem] top-2 h-2.5 w-2.5 rounded-full bg-accent"
              style={{ boxShadow: "0 0 10px 2px rgba(201,174,114,0.6)" }}
            />
            <div className="glass-soft rounded-3xl px-5 py-4">
              <p className="font-serif text-lg font-light text-foreground">{e.role[lang]}</p>
              <div className="mt-1 flex items-center gap-2.5">
                {e.logo ? (
                  <span className="relative h-6 w-6 shrink-0 overflow-hidden rounded-md bg-card/70 ring-1 ring-border/70">
                    <Image src={e.logo || "/placeholder.svg"} alt="" fill sizes="24px" className="object-contain p-0.5" />
                  </span>
                ) : null}
                <p className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-accent">{e.org[lang]}</p>
              </div>
              <p className="mt-2 font-sans text-sm font-light leading-relaxed text-foreground/75">{e.note[lang]}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    )
  }

  return (
    <div className="space-y-5">
      <motion.p
        {...stagger(0)}
        className="font-serif text-xl font-light italic leading-relaxed text-foreground text-pretty sm:text-2xl"
      >
        {contact.closing[lang]}
      </motion.p>
      <motion.p
        {...stagger(1)}
        className="font-sans text-sm font-light leading-relaxed text-foreground/75"
      >
        {contact.intro[lang]}
      </motion.p>
      <span
        aria-hidden
        className="my-1 block h-px w-20 bg-gradient-to-r from-transparent via-accent/70 to-transparent"
      />
      <div className="flex flex-col gap-2.5">
        {contact.links.map((l, i) => (
          <motion.a
            key={l.label}
            {...stagger(i + 2)}
            href={l.href}
            target={l.href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            data-hover
            whileHover={{ x: 5 }}
            className="glass-soft flex items-center justify-between gap-3 rounded-2xl px-4 py-3 font-sans text-sm text-foreground"
          >
            <span className="text-muted-foreground">{l.label}</span>
            <span className="text-accent">{l.value}</span>
          </motion.a>
        ))}
      </div>
    </div>
  )
}
