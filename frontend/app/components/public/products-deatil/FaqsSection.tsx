"use client";

import React from "react";

interface FAQ {
  question: string;
  answer: string;
}

interface FaqsSectionProps {
  faqs: FAQ[];
  openFaqIndex: number | null;
  setOpenFaqIndex: (index: number | null) => void;
}

export const FaqsSection: React.FC<FaqsSectionProps> = ({
  faqs,
  openFaqIndex,
  setOpenFaqIndex,
}) => {
  if (!faqs?.length) return null;

  return (
    <section className="py-14 sm:py-20 bg-[#f7f4ef] border-t border-[#e5ddd0]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 lg:gap-16 items-start">
          <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#1a1208]">
            Frequently Asked
            <br className="hidden lg:block" />
            Questions
          </h2>
          <div className="border-t border-[#e5ddd0]">
            {faqs.map((faq, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <div key={i} className={`border-b border-[#e5ddd0] ${isOpen ? "bg-[#f7f4ef]/50" : ""}`}>
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    className="w-full flex justify-between items-center py-4 px-2 bg-transparent border-none cursor-pointer text-left font-outfit font-semibold text-sm text-[#2e2015] hover:text-[#8b6240] transition-colors"
                  >
                    <span>{faq.question}</span>
                    <span className="text-xl font-light text-[#8b6240]">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && (
                    <div className="px-2 pb-4 animate-[slideDown_0.25s_ease_both]">
                      <p className="text-sm text-[#4a3a28] leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};