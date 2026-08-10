"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

interface FilterPanelProps {
  categories: Array<{ key: string; label: string; value: string }>;
  categoriesLoading: boolean;
  categoriesError: string | null;
  draftFilters: {
    category: string;
    minPrice: string;
    maxPrice: string;
    sort: string;
    stockFilter: string;
    onSale: boolean;
    minRating: string;
  };
  onClose: () => void;
  onApply: (filters: any) => void;
  onReset: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  categories,
  categoriesLoading,
  categoriesError,
  draftFilters: initialFilters,
  onClose,
  onApply,
  onReset,
}) => {
  const [filters, setFilters] = useState(initialFilters);

  const handleChange = (field: string, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div
      className="fixed inset-0 bg-[#18120c]/60 backdrop-blur-sm flex justify-center items-stretch p-0 z-[1000]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[960px] h-screen overflow-y-auto bg-[#fffaf1] border-x border-[#b5976a]/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] p-10 sm:p-8 md:p-12 animate-[fadeIn_0.35s_ease_forwards]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center gap-3 mb-5 sticky top-0 pb-3.5 bg-[#fffaf1]">
          <div>
            <p className="text-lg font-bold text-[#3c2a17] m-0">Refine Selection</p>
            <span className="text-sm text-[#3c2a17]/75">
              Adjust categories, price range, status &amp; sort order
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-[38px] h-[38px] rounded-full bg-[#b5976a]/15 text-[#6b4c25] text-2xl font-semibold border-none cursor-pointer transition-all hover:bg-[#b5976a]/25 hover:rotate-3"
            aria-label="Close filters"
          >
            <X className="w-5 h-5 mx-auto" />
          </button>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <h4 className="text-sm uppercase tracking-[0.08em] text-[#3c2a17]/75 m-0 mb-3">
            Categories
          </h4>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              className={`px-4 py-2.5 rounded-full font-semibold border-none transition-all ${
                !filters.category
                  ? "bg-gradient-to-r from-[#f6c77a] to-[#e7ad5b] text-white shadow-[0_8px_18px_rgba(231,173,91,0.35)]"
                  : "bg-[#3c2a17]/10 text-[#3c2a17] hover:bg-[#3c2a17]/15 hover:-translate-y-0.5"
              }`}
              onClick={() => handleChange("category", "")}
            >
              All
            </button>
            {categoriesLoading && (
              <span className="text-sm text-[#6b4c25]">Loading...</span>
            )}
            {categoriesError && (
              <span className="text-sm text-[#dc2626] font-semibold">
                Unable to load categories
              </span>
            )}
            {!categoriesLoading &&
              !categoriesError &&
              categories.map((category) => (
                <button
                  type="button"
                  key={category.key}
                  className={`px-4 py-2.5 rounded-full font-semibold border-none transition-all ${
                    filters.category === category.value
                      ? "bg-gradient-to-r from-[#f6c77a] to-[#e7ad5b] text-white shadow-[0_8px_18px_rgba(231,173,91,0.35)]"
                      : "bg-[#3c2a17]/10 text-[#3c2a17] hover:bg-[#3c2a17]/15 hover:-translate-y-0.5"
                  }`}
                  onClick={() => handleChange("category", category.value)}
                >
                  {category.label}
                </button>
              ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <h4 className="text-sm uppercase tracking-[0.08em] text-[#3c2a17]/75 m-0 mb-3">
            Price Range
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-2 text-sm text-[#3c2a17]/75 font-semibold">
              Min
              <input
                type="number"
                min="0"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => handleChange("minPrice", e.target.value)}
                className="border border-[#3c2a17]/20 rounded-2xl px-4 py-3 text-sm font-semibold text-[#3c2a17] bg-white/90 transition-all focus:outline-none focus:border-[#b5976a] focus:shadow-[0_8px_18px_rgba(181,151,106,0.25)]"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[#3c2a17]/75 font-semibold">
              Max
              <input
                type="number"
                min="0"
                placeholder="10,000"
                value={filters.maxPrice}
                onChange={(e) => handleChange("maxPrice", e.target.value)}
                className="border border-[#3c2a17]/20 rounded-2xl px-4 py-3 text-sm font-semibold text-[#3c2a17] bg-white/90 transition-all focus:outline-none focus:border-[#b5976a] focus:shadow-[0_8px_18px_rgba(181,151,106,0.25)]"
              />
            </label>
          </div>
        </div>

        {/* Stock Filter */}
        <div className="mb-6">
          <h4 className="text-sm uppercase tracking-[0.08em] text-[#3c2a17]/75 m-0 mb-3">
            Availability
          </h4>
          <div className="flex flex-wrap gap-2.5">
            {[
              { label: "All", value: "" },
              { label: "In Stock", value: "instock" },
              { label: "Out of Stock", value: "outofstock" },
              { label: "Low Stock", value: "lowstock" },
            ].map((opt) => (
              <button
                type="button"
                key={opt.value}
                className={`px-4 py-2.5 rounded-xl border transition-all ${
                  filters.stockFilter === opt.value
                    ? "border-transparent bg-[#3c2a17] text-white shadow-[0_10px_20px_rgba(32,22,13,0.35)]"
                    : "border-[#3c2a17]/20 bg-[#3c2a17]/5 text-[#3c2a17] hover:bg-[#3c2a17]/10"
                }`}
                onClick={() => handleChange("stockFilter", opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* On Sale Filter */}
        <div className="mb-6">
          <h4 className="text-sm uppercase tracking-[0.08em] text-[#3c2a17]/75 m-0 mb-3">
            Deals
          </h4>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              className={`px-4 py-2.5 rounded-xl border transition-all ${
                !filters.onSale
                  ? "border-transparent bg-[#3c2a17] text-white shadow-[0_10px_20px_rgba(32,22,13,0.35)]"
                  : "border-[#3c2a17]/20 bg-[#3c2a17]/5 text-[#3c2a17] hover:bg-[#3c2a17]/10"
              }`}
              onClick={() => handleChange("onSale", false)}
            >
              All Products
            </button>
            <button
              type="button"
              className={`px-4 py-2.5 rounded-xl border transition-all ${
                filters.onSale
                  ? "border-transparent bg-[#3c2a17] text-white shadow-[0_10px_20px_rgba(32,22,13,0.35)]"
                  : "border-[#3c2a17]/20 bg-[#3c2a17]/5 text-[#3c2a17] hover:bg-[#3c2a17]/10"
              }`}
              onClick={() => handleChange("onSale", true)}
            >
              🏷️ On Sale
            </button>
          </div>
        </div>

        {/* Rating Filter */}
        <div className="mb-6">
          <h4 className="text-sm uppercase tracking-[0.08em] text-[#3c2a17]/75 m-0 mb-3">
            Minimum Rating
          </h4>
          <div className="flex flex-wrap gap-2.5">
            {[
              { label: "All", value: "" },
              { label: "2★ & above", value: "2" },
              { label: "3★ & above", value: "3" },
              { label: "4★ & above", value: "4" },
            ].map((opt) => (
              <button
                type="button"
                key={opt.value}
                className={`px-4 py-2.5 rounded-xl border transition-all ${
                  filters.minRating === opt.value
                    ? "border-transparent bg-[#3c2a17] text-white shadow-[0_10px_20px_rgba(32,22,13,0.35)]"
                    : "border-[#3c2a17]/20 bg-[#3c2a17]/5 text-[#3c2a17] hover:bg-[#3c2a17]/10"
                }`}
                onClick={() => handleChange("minRating", opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort By */}
        <div className="mb-6">
          <h4 className="text-sm uppercase tracking-[0.08em] text-[#3c2a17]/75 m-0 mb-3">
            Sort By
          </h4>
          <div className="w-full">
            <select
              value={filters.sort}
              onChange={(e) => handleChange("sort", e.target.value)}
              className="w-full border border-[#3c2a17]/20 rounded-2xl px-4 py-3 text-sm font-semibold text-[#3c2a17] bg-white/90 outline-none transition-all focus:border-[#b5976a] focus:shadow-[0_8px_18px_rgba(181,151,106,0.25)]"
            >
              <option value="-totalReviews -averageRating -createdAt">
                Top reviewed (default)
              </option>
              <option value="-createdAt">Newest arrivals</option>
              <option value="createdAt">Oldest first</option>
              <option value="-price">Price: High to Low</option>
              <option value="price">Price: Low to High</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3.5 mt-2">
          <button
            type="button"
            onClick={onReset}
            className="flex-1 border-none rounded-2xl py-3.5 text-base font-bold bg-[#3c2a17]/10 text-[#3c2a17] cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_14px_rgba(60,42,23,0.15)]"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => onApply(filters)}
            className="flex-1 border-none rounded-2xl py-3.5 text-base font-bold bg-gradient-to-r from-[#f25858] to-[#dc2626] text-white shadow-[0_12px_28px_rgba(220,38,38,0.4)] cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(220,38,38,0.45)]"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;