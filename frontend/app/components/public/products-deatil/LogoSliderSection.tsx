"use client";

import React from "react";
import { AppImage } from "@/app/components/ui/AppImage";

const logoFiles = ["logo1.webp", "logo2.webp", "logo3.webp"];
const repeatedLogos = [...logoFiles, ...logoFiles, ...logoFiles, ...logoFiles, ...logoFiles, ...logoFiles];

export const LogoSliderSection: React.FC = () => (
  <section className="py-12 sm:py-16 bg-[#f7f4ef] border-t border-[#e5ddd0] overflow-hidden">
    <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
      <div className="relative overflow-hidden">
        <div className="flex gap-8 sm:gap-12 w-max animate-[logoScroll_12s_linear_infinite] hover:animation-play-state-paused">
          {repeatedLogos.map((logo, i) => (
            <AppImage
              key={`logo-${logo}-${i}`}
              src={`/logo/${logo}`}
              alt={`Partner ${(i % logoFiles.length) + 1}`}
              width={150}
              height={90}
              className="w-[120px] sm:w-[150px] h-[70px] sm:h-[90px] object-contain p-2 sm:p-2.5 bg-white rounded-lg border border-[#e5ddd0] flex-shrink-0"
              iconSize={24}
              priority={i < logoFiles.length}
            />
          ))}
        </div>
      </div>
    </div>
  </section>
);