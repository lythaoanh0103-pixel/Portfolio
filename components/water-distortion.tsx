"use client"

/**
 * A single, near-invisible layer of real optical distortion.
 *
 * Rather than simulating "water" with more sprites, this bends the pixels of
 * whatever sits behind it — the ocean canvas — using an SVG turbulence
 * filter applied as a `backdrop-filter`. The turbulence field drifts on a
 * very long, slow cycle (a minute or more per pass) so the distortion is
 * felt rather than seen: the scene never looks static, but a visitor would
 * struggle to point at the exact moment it moved.
 *
 * Sits just above the OceanCanvas (z-[1]) and below all real content, so
 * only the water itself refracts — text and UI stay crisp.
 *
 * Progressive enhancement: browsers without SVG `backdrop-filter` support
 * simply render this as a fully transparent, inert layer.
 */
export function WaterDistortion() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[1] h-full w-full">
      <svg className="absolute h-0 w-0" aria-hidden focusable="false">
        <filter id="water-refraction" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.0035 0.006"
            numOctaves={2}
            seed={7}
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              dur="70s"
              values="0.0035 0.006;0.005 0.004;0.0035 0.006"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feGaussianBlur in="noise" stdDeviation="6" result="softNoise" />
          <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="10" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div
        className="h-full w-full"
        style={{
          backdropFilter: "url(#water-refraction)",
          WebkitBackdropFilter: "url(#water-refraction)",
        }}
      />
    </div>
  )
}
