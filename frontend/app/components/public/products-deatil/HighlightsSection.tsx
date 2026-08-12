"use client";

import React from "react";

interface HighlightsSectionProps {
  highlights: string[];
}

export const HighlightsSection: React.FC<HighlightsSectionProps> = ({ highlights }) => {
  if (!highlights?.length) return null;

  return (
    <section className="py-14 sm:py-20 bg-[#f7f4ef] border-t border-[#e5ddd0]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="text-center max-w-[680px] mx-auto mb-12">
          <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#1a1208] mb-3">
            Why Choose This Product
          </h2>
          <p className="text-[#7a6558] leading-relaxed">Discover what makes this product exceptional</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {highlights.map((h, i) => (
            <div
              key={i}
              className="bg-white border border-[#e5ddd0] rounded-xl p-7 relative overflow-hidden transition-all hover:-translate-y-1.5 hover:shadow-[0_20px_48px_rgba(74,51,32,0.13)] hover:border-[#c8b99a]"
            >
              <span className="font-playfair text-5xl font-black text-[#f1ece4] block mb-3 select-none">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-playfair text-lg font-bold text-[#1a1208] mb-2">{h}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};