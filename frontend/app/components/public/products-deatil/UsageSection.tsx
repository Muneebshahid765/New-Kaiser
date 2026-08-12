"use client";

import React from "react";

interface UsageSectionProps {
  hasUsageInstructions: boolean;
  usageInstructionsContent: string[];
}

export const UsageSection: React.FC<UsageSectionProps> = ({
  hasUsageInstructions,
  usageInstructionsContent,
}) => {
  if (!hasUsageInstructions) return null;

  return (
    <section className="py-14 sm:py-20 bg-white border-t border-[#e5ddd0]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="text-center max-w-[680px] mx-auto mb-10">
          <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#1a1208] mb-2">
            How to Use
          </h2>
          <p className="text-[#7a6558]">Simple steps for optimal results</p>
        </div>

        <div className="max-w-[900px] mx-auto">
          {usageInstructionsContent.length > 1 ? (
            <div className="flex flex-col gap-5">
              {usageInstructionsContent.map((line, i) => (
                <div
                  key={i}
                  className="flex items-start gap-5 p-6 bg-white border-[1.5px] border-[#e5ddd0] rounded-xl transition-all hover:translate-x-2 hover:border-[#8b6240] hover:shadow-sm hover:bg-[#f7f4ef]"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-[#8b6240] to-[#b58a62] flex items-center justify-center text-white font-playfair text-lg font-bold shadow-[0_4px_12px_rgba(139,98,64,0.25)] transition-all hover:scale-110 hover:-rotate-3">
                    {i + 1}
                  </div>
                  <p className="flex-1 text-sm font-medium text-[#4a3a28] leading-relaxed pt-2">
                    {line}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-start gap-5 p-7 bg-white border-[1.5px] border-[#e5ddd0] rounded-2xl transition-all hover:border-[#8b6240] hover:shadow-sm hover:-translate-y-1">
              <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r from-[#f1ece4] to-[#f7f4ef] border-2 border-[#e0d5c5] flex items-center justify-center text-2xl transition-all hover:rotate-10 hover:scale-110 hover:border-[#8b6240]">
                📋
              </span>
              <p className="flex-1 text-sm font-medium text-[#4a3a28] leading-relaxed pt-1">
                {usageInstructionsContent[0]}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};