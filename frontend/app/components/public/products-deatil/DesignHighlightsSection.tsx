"use client";

import React from "react";
import { AppImage } from "@/app/components/ui/AppImage";

interface DesignHighlightItem {
  image: string;
  title: string;
  description: string;
}

interface DesignHighlightsSectionProps {
  designHighlightItems: DesignHighlightItem[];
}

export const DesignHighlightsSection: React.FC<DesignHighlightsSectionProps> = ({
  designHighlightItems,
}) => {
  if (!designHighlightItems?.length) return null;

  return (
    <section className="py-14 sm:py-20 bg-white border-t border-[#e5ddd0]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[2px] text-[#a89880]">Crafted Details</p>
            <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#1a1208]">Design Highlights</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {designHighlightItems.map((item, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-[#1a1208] border border-black/10">
                <AppImage
                  src={item.image}
                  alt={item.title || `Feature ${i + 1}`}
                  width={320}
                  height={320}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  iconSize={32}
                />
              </div>
              <div>
                <h3 className="font-outfit text-sm font-bold text-[#1a1208] uppercase tracking-[0.5px]">
                  {item.title}
                </h3>
                <p className="text-xs text-[#4a3a28] leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};