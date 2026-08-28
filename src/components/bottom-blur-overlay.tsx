const LAYERS = 24;
const HEIGHT_PX = 96;
const MAX_BLUR_PX = 20;
const TINT_COLOR = "22, 22, 24"; // #161618
const TOP_OPACITY = 0.01;
const BOTTOM_OPACITY = 0.2;

export function BottomBlurOverlay() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30" style={{ height: HEIGHT_PX }}>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, rgba(${TINT_COLOR}, ${TOP_OPACITY}) 0%, rgba(${TINT_COLOR}, ${BOTTOM_OPACITY}) 100%)`,
        }}
      />
      {/* Non-overlapping hard-edged bands: each backdrop-filter samples the page
          directly, so adjacent layers never blur an already-blurred layer
          beneath them (that compounding is what made the effect look like a
          single heavy uniform blur instead of a gradient in some browsers). */}
      {Array.from({ length: LAYERS }).map((_, i) => {
        const start = (i / LAYERS) * 100;
        const end = ((i + 1) / LAYERS) * 100;
        const mask = `linear-gradient(to top, transparent ${start}%, black ${start}%, black ${end}%, transparent ${end}%)`;
        const blur = ((LAYERS - 1 - i) / (LAYERS - 1)) * MAX_BLUR_PX;
        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        );
      })}
    </div>
  );
}
