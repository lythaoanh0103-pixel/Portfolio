The floating glass player plays one fixed playlist, in this order:

  1. Flower Day (Piano)          -> flower-day.m4a
  2. Uri no Uta (Piano & Cello)  -> uri-no-uta.m4a
  3. Golden Hour (Piano)         -> golden-hour.m4a

These filenames are wired up in lib/atmosphere.ts (see `playlist`). Swap the
files here with the same names to change the music, or edit `playlist` to
point at different filenames/titles.

Each song also carries the world whose colour palette it belongs to. While a
song plays, the whole site (ocean canvas + every glass surface) eases toward
that world's palette over a couple of seconds:

  Flower Day   -> Silent Reverie (soft pink, petals, warm reflections)
  Uri no Uta   -> Moonlit Abyss  (deep night blue, jellyfish, stars)
  Golden Hour  -> Endless Blue   (sparkling morning light)

Playback starts only after the visitor clicks "Begin Journey" (never before
the first interaction, to respect browser autoplay rules), then loops
through the three songs continuously while they explore. If a file is ever
missing, the player still runs: the progress bar animates on a gentle timer
so the interface never feels broken.
