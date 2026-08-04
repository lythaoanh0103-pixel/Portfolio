import type { Lang } from "@/lib/content"

/**
 * Three worlds the visitor can drift between. Each one is a whole atmosphere —
 * a palette for the living ocean canvas, a set of decorative layers that come
 * alive, and a DOM theme (CSS variables). The single playlist below (see
 * `playlist`) walks through all three worlds in song order — the world
 * changes with the music, not the other way around.
 */

export type AtmosphereId = "endlessBlue" | "silentReverie" | "moonlitAbyss"

type Bi = Record<Lang, string>
type RGB = [number, number, number]

export type Track = {
  title: Bi
  /** Short bilingual note shown under the title in the track list (instrumentation, not a resume-style caption). */
  note: Bi
  /** File dropped into /public/music. Missing files degrade gracefully. */
  src: string
  /** Fallback length (seconds) used for the progress bar until real metadata loads. */
  seconds: number
  /** Which world's palette this song carries the room into. */
  world: AtmosphereId
}

export type AtmosphereLayers = {
  bubbles: boolean
  petals: boolean
  jellyfish: boolean
  stars: boolean
  fog: boolean
  paperBoats: boolean
  fireflies: boolean
}

export type Atmosphere = {
  id: AtmosphereId
  name: Bi
  mood: Bi
  /** Canvas colours, as rgb triplets. */
  palette: {
    top: RGB
    bottom: RGB
    accent: RGB
    particle: RGB
    ray: RGB
  }
  /** DOM theme, written onto <html> as CSS variables so surfaces morph too. */
  css: Record<string, string>
  layers: AtmosphereLayers
}

const noLayers: AtmosphereLayers = {
  bubbles: true,
  petals: false,
  jellyfish: false,
  stars: false,
  fog: false,
  paperBoats: false,
  fireflies: false,
}

export const atmospheres: Record<AtmosphereId, Atmosphere> = {
  endlessBlue: {
    id: "endlessBlue",
    name: { en: "Endless Blue", vi: "Xanh vô tận" },
    mood: {
      en: "Morning. A sparkling sea, golden light, and the freedom of an open sky.",
      vi: "Buổi sáng. Mặt biển lấp lánh, ánh vàng, và sự tự do của bầu trời rộng mở.",
    },
    palette: {
      top: [231, 244, 251],
      bottom: [150, 203, 238],
      accent: [201, 174, 114],
      particle: [251, 247, 239],
      ray: [255, 249, 232],
    },
    css: {
      "--background": "#eef7fd",
      "--foreground": "#2c4b68",
      "--card": "#f7fbfd",
      "--card-foreground": "#2c4b68",
      "--popover": "#f7fbfd",
      "--popover-foreground": "#2c4b68",
      "--primary": "#4f8fc0",
      "--primary-foreground": "#f7fbfd",
      "--secondary": "#ddeffa",
      "--secondary-foreground": "#2c4b68",
      "--muted": "#edf7fb",
      "--muted-foreground": "#5c7f9c",
      "--accent": "#c9ae72",
      "--accent-foreground": "#2c4b68",
      "--gold": "#c9ae72",
      "--border": "#cbe5f7",
      "--input": "#cbe5f7",
      "--ring": "#a8d5f2",
      "--cursor-spark": "201,174,114",
      "--cursor-foam": "251,247,239",
      "--cursor-glow": "168,213,242",
    },
    layers: { ...noLayers, petals: false, fog: false },
  },
  silentReverie: {
    id: "silentReverie",
    name: { en: "Silent Reverie", vi: "Mộng lặng" },
    mood: {
      en: "Afternoon watercolour. Petals, paper boats, letters, and warm reflections.",
      vi: "Màu nước buổi chiều. Cánh hoa, thuyền giấy, những lá thư, và ánh phản chiếu ấm áp.",
    },
    palette: {
      top: [249, 240, 233],
      bottom: [214, 205, 220],
      accent: [198, 148, 122],
      particle: [252, 244, 238],
      ray: [255, 240, 226],
    },
    css: {
      "--background": "#f6ede8",
      "--foreground": "#5a4a52",
      "--card": "#faf3ee",
      "--card-foreground": "#5a4a52",
      "--popover": "#faf3ee",
      "--popover-foreground": "#5a4a52",
      "--primary": "#b98a86",
      "--primary-foreground": "#faf3ee",
      "--secondary": "#efe1dd",
      "--secondary-foreground": "#5a4a52",
      "--muted": "#f2e8e4",
      "--muted-foreground": "#8a7078",
      "--accent": "#c6947a",
      "--accent-foreground": "#5a4a52",
      "--gold": "#c6947a",
      "--border": "#e6d6d0",
      "--input": "#e6d6d0",
      "--ring": "#dcc4bb",
      "--cursor-spark": "198,148,122",
      "--cursor-foam": "252,244,238",
      "--cursor-glow": "220,196,187",
    },
    layers: { ...noLayers, petals: true, paperBoats: true, fog: true },
  },
  moonlitAbyss: {
    id: "moonlitAbyss",
    name: { en: "Moonlit Abyss", vi: "Vực sâu dưới trăng" },
    mood: {
      en: "Night ocean. Moonlight, jellyfish, glowing fish, and stars on the water.",
      vi: "Đại dương về đêm. Ánh trăng, sứa biển, cá phát sáng, và những vì sao in trên mặt nước.",
    },
    palette: {
      top: [30, 52, 84],
      bottom: [10, 22, 48],
      accent: [150, 197, 224],
      particle: [180, 214, 244],
      ray: [173, 205, 240],
    },
    css: {
      "--background": "#0b1830",
      "--foreground": "#d7e6f5",
      "--card": "#122241",
      "--card-foreground": "#d7e6f5",
      "--popover": "#122241",
      "--popover-foreground": "#d7e6f5",
      "--primary": "#6ea3d4",
      "--primary-foreground": "#0b1830",
      "--secondary": "#1a2c4d",
      "--secondary-foreground": "#d7e6f5",
      "--muted": "#16274a",
      "--muted-foreground": "#8ba7c9",
      "--accent": "#96c5e0",
      "--accent-foreground": "#0b1830",
      "--gold": "#c9ae72",
      "--border": "#26385c",
      "--input": "#26385c",
      "--ring": "#3b567f",
      "--cursor-spark": "150,197,224",
      "--cursor-foam": "215,230,245",
      "--cursor-glow": "110,163,212",
    },
    layers: { ...noLayers, jellyfish: true, stars: true, fireflies: true, fog: true },
  },
}

/**
 * The one and only playlist, in the exact order the visitor should hear it.
 * Each song also carries the world whose palette it belongs to — when a song
 * becomes current, the whole environment eases toward that world's colours
 * over a few seconds, so the ocean's mood always follows the music instead
 * of the two drifting independently.
 */
export const playlist: Track[] = [
  {
    title: { en: "Flower Day", vi: "Flower Day" },
    note: { en: "Piano", vi: "Dương cầm" },
    src: "/music/flower-day.m4a",
    seconds: 98,
    world: "silentReverie",
  },
  {
    title: { en: "Uri no Uta", vi: "Uri no Uta" },
    note: { en: "Piano & Cello", vi: "Dương cầm & Cello" },
    src: "/music/uri-no-uta.m4a",
    seconds: 36,
    world: "moonlitAbyss",
  },
  {
    title: { en: "Golden Hour", vi: "Golden Hour" },
    note: { en: "Piano", vi: "Dương cầm" },
    src: "/music/golden-hour.m4a",
    seconds: 59,
    world: "endlessBlue",
  },
]

export const playerUi = {
  nowPlaying: { en: "Now drifting", vi: "Đang trôi" },
  play: { en: "Play", vi: "Phát" },
  pause: { en: "Pause", vi: "Tạm dừng" },
  next: { en: "Next", vi: "Bài sau" },
  prev: { en: "Previous", vi: "Bài trước" },
  volume: { en: "Volume", vi: "Âm lượng" },
  playlist: { en: "Playlist", vi: "Danh sách" },
  expand: { en: "Open player", vi: "Mở trình phát" },
  collapse: { en: "Minimise player", vi: "Thu gọn trình phát" },
} satisfies Record<string, Bi>
