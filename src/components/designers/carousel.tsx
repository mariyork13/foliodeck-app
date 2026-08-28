"use client";

import { useState } from "react";
import { ChevronLeftIcon } from "@/components/icons";

export function DesignerCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex h-[160px] w-full items-center justify-center rounded-[10px] bg-[#2A2A2E] text-[13px] text-white/20">
        Нет изображений
      </div>
    );
  }

  const clamped = Math.min(index, images.length - 1);
  const go = (delta: number) =>
    setIndex((i) => (i + delta + images.length) % images.length);

  return (
    <div className="relative overflow-hidden rounded-[10px] bg-[#2A2A2E]">
      <div className="h-[200px] w-full sm:h-[240px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[clamped]}
          alt={alt}
          className="h-full w-full object-cover object-top"
        />
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Предыдущее"
            onClick={() => go(-1)}
            className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60"
          >
            <ChevronLeftIcon size={16} />
          </button>
          <button
            type="button"
            aria-label="Следующее"
            onClick={() => go(1)}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 rotate-180 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60"
          >
            <ChevronLeftIcon size={16} />
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                aria-label={`Изображение ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === clamped ? "w-4 bg-white" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
