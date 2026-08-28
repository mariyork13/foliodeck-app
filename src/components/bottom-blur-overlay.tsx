const LAYERS = 16;
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
      {Array.from({ length: LAYERS }).map((_, i) => {
        const start = (i / LAYERS) * 100;
        const mid1 = ((i + 1) / LAYERS) * 100;
        const mid2 = ((i + 2) / LAYERS) * 100;
        const end = ((i + 3) / LAYERS) * 100;
        const mask = `linear-gradient(to top, rgba(0,0,0,0) ${start}%, rgba(0,0,0,1) ${mid1}%, rgba(0,0,0,1) ${mid2}%, rgba(0,0,0,0) ${end}%)`;
        const blur = ((LAYERS - i) / LAYERS) * MAX_BLUR_PX;
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
