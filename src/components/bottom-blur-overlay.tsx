const HEIGHT_PX = 96;
const MAX_BLUR_PX = 20;
const TINT_COLOR = "22, 22, 24"; // #161618
const TOP_OPACITY = 0.01;
const BOTTOM_OPACITY = 0.2;

export function BottomBlurOverlay() {
  const mask = "linear-gradient(to top, black 0%, transparent 100%)";
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30" style={{ height: HEIGHT_PX }}>
      {/* A single constant-blur layer whose visibility fades in via mask-image
          (0% at the top, 100% at the bottom) reads as a smooth progressive
          blur with zero seams — stacking layers with different blur radii
          always shows a visible edge where the radius changes, since blur
          isn't just opacity, it physically spreads pixels. */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: `blur(${MAX_BLUR_PX}px)`,
          WebkitBackdropFilter: `blur(${MAX_BLUR_PX}px)`,
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, rgba(${TINT_COLOR}, ${TOP_OPACITY}) 0%, rgba(${TINT_COLOR}, ${BOTTOM_OPACITY}) 100%)`,
        }}
      />
    </div>
  );
}
