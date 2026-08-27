// The live site is a Tilda Zero Block canvas that scales linearly with
// viewport width (its base design width is 1920px), so text and control
// sizes are expressed as clamp(min, vw, valueAt1920px) to track the same
// scale instead of staying fixed regardless of window width.
export const TEXT_SCALE = "text-[clamp(11px,0.625vw,12px)]";
