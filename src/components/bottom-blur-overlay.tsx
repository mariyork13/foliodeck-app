const LAYERS = 8;
const HEIGHT_PX = 120;
const MAX_BLUR_PX = 12;

export function BottomBlurOverlay() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30" style={{ height: HEIGHT_PX }}>
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
