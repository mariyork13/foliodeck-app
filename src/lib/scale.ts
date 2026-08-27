// The live site is a Tilda Zero Block canvas whose "desktop" artboard
// scales linearly with viewport width from 1920px down to a 1200px floor
// (below 1200px it switches to a differently-authored tablet/mobile
// design, not just a smaller version of the same one — out of scope for
// now). Each value below is clamp(valueAt1200px, valueAt1920pxInVw, valueAt1920px).
export const TEXT_SCALE = "text-[clamp(7.5px,0.625vw,12px)]";
