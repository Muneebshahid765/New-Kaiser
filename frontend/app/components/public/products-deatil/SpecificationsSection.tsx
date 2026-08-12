"use client";

import React from "react";

interface SpecificationsSectionProps {
  specEntries: [string, any][];
}

export const SpecificationsSection: React.FC<SpecificationsSectionProps> = ({ specEntries }) => {
  if (!specEntries?.length) return null;

  return (
    <section className="py-14 sm:py-20 bg-white border-t border-[#e5ddd0]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="text-center max-w-[680px] mx-auto mb-10">
          <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#1a1208] mb-2">
            Technical Specifications
          </h2>
          <p className="text-[#7a6558]">Detailed product information at a glance</p>
        </div>
        <div className="max-w-[900px] mx-auto rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(74,51,32,0.1)] border border-[#e5ddd0]">
          <table className="w-full border-collapse bg-white">
            <tbody>
              {specEntries.map(([key, value], i) => (
                <tr
                  key={key}
                  className="border-b border-[#e5ddd0] last:border-0 transition-all hover:bg-gradient-to-r hover:from-[#f7f4ef] hover:to-transparent hover:translate-x-1"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <td className="w-[40%] px-6 sm:px-8 py-5 text-sm font-bold uppercase tracking-[1.2px] text-[#2e2015] bg-[#f1ece4] border-r border-[#e5ddd0]">
                    <span className="inline-block mr-2.5 text-[#8b6240] text-sm opacity-0 group-hover:opacity-100 transition-all">▸</span>
                    {key}
                  </td>
                  <td className="w-[60%] px-6 sm:px-8 py-5 text-sm font-medium text-[#1a1208] text-right">
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};