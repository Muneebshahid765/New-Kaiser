"use client";

import React from "react";

interface NutritionFact {
  name: string;
  value: number;
  unit: string;
  description?: string;
  highlight?: boolean;
  isPrimary?: boolean;
  isKey?: boolean;
}

interface NutritionSectionProps {
  nutritionFacts: NutritionFact[];
  currentProduct: any;
  isNutritionExpanded: boolean;
  setIsNutritionExpanded: (value: boolean) => void;
}

export const PackageContentSection: React.FC<NutritionSectionProps> = ({
  nutritionFacts,
  currentProduct,
  isNutritionExpanded,
  setIsNutritionExpanded,
}) => {
  if (!nutritionFacts?.length) return null;

  return (
    <section className="py-14 sm:py-20 bg-[#f7f4ef] border-t border-[#e5ddd0]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="text-center max-w-[680px] mx-auto mb-10">
          <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#1a1208] mb-2">
            Nutrition Facts
          </h2>
          <p className="text-[#7a6558]">Complete nutritional breakdown per serving</p>
        </div>

        <div className="max-w-[900px] mx-auto">
          {/* Toggle Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-7 border-[1.5px] border-[#e5ddd0] rounded-2xl bg-gradient-to-r from-[#f7f4ef]/95 to-white/95 shadow-sm mb-4">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[2px] text-[#a89880] font-bold">Key matrix</p>
              <h3 className="font-playfair text-xl sm:text-2xl text-[#1a1208] mt-1">Macros &amp; Micros Overview</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsNutritionExpanded(!isNutritionExpanded)}
              className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-full border-[1.5px] text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md ${
                isNutritionExpanded
                  ? "bg-[#8b6240] text-white border-[#8b6240] shadow-[0_12px_28px_rgba(61,40,24,0.25)]"
                  : "border-[#b58a62] bg-white text-[#603e20]"
              }`}
            >
              <span>{isNutritionExpanded ? "Hide table" : "Show table"}</span>
              <span className="text-xl">{isNutritionExpanded ? "−" : "+"}</span>
            </button>
          </div>

          {/* Table */}
          <div
            className={`border border-[#e5ddd0] rounded-2xl overflow-hidden bg-white shadow-[0_8px_32px_rgba(74,51,32,0.1)] transition-all ${
              isNutritionExpanded ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0 pointer-events-none border-transparent shadow-none"
            }`}
          >
            {/* Calories */}
            {(currentProduct?.calories || currentProduct?.calorieCount) && (
              <div className="p-5 sm:p-7 bg-gradient-to-r from-[#8b6240] to-[#a08060] text-white">
                <div className="text-center">
                  <span className="font-playfair text-4xl sm:text-5xl font-bold">
                    {currentProduct?.calories || currentProduct?.calorieCount}
                  </span>
                  <small className="block text-sm uppercase tracking-[1.5px] font-semibold opacity-90">
                    Calories
                  </small>
                </div>
              </div>
            )}

            {isNutritionExpanded && (
              <table className="w-full border-collapse">
                <thead className="bg-gradient-to-r from-[#8b6240] to-[#a08060] text-white">
                  <tr>
                    <th className="px-5 sm:px-7 py-4 text-left text-xs uppercase tracking-[1.2px] font-semibold">
                      Nutrient
                    </th>
                    <th className="px-5 sm:px-7 py-4 text-right text-xs uppercase tracking-[1.2px] font-semibold">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {nutritionFacts.map((fact, index) => {
                    const formattedValue = [fact.value, fact.unit].filter(Boolean).join(" ");
                    const highlightRow = fact.highlight || fact.isPrimary || fact.isKey;
                    return (
                      <tr
                        key={`${fact.name || index}-row`}
                        className={`border-b border-[#e5ddd0] last:border-0 transition-all hover:bg-gradient-to-r hover:from-[#c8b99a]/15 hover:to-transparent hover:translate-x-1 ${
                          highlightRow ? "bg-gradient-to-r from-[#c8b99a]/25 to-[#e0d5c5]/15 border-l-3 border-l-[#8b6240]" : ""
                        }`}
                      >
                        <td className="px-5 sm:px-7 py-4 text-sm font-semibold text-[#5a3a1f]">
                          <span className="inline-block mr-2.5 text-[#a08060]">▸</span>
                          <div>
                            <span className="block">{fact.name}</span>
                            {fact.description && (
                              <span className="block text-xs text-[#8b6240] font-normal">{fact.description}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 sm:px-7 py-4 text-sm font-bold text-[#7a5c3c] text-right">
                          {formattedValue || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};