"use client";

import React from "react";
import { X } from "lucide-react";

interface ActiveFiltersProps {
  chips: Array<{ key: string; label: string; type: string }>;
  onClear: (type: string) => void;
  onClearAll: () => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  chips,
  onClear,
  onClearAll,
}) => {
  if (chips.length === 0) return null;

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 -mt-2 mb-4 py-3">
      <div className="flex items-center flex-wrap gap-2.5 w-full overflow-visible pb-1">
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => onClear(chip.type)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border-none bg-[#3c2a17]/10 text-[#3c2a17] font-semibold cursor-pointer transition-all hover:bg-[#3c2a17]/20 hover:-translate-y-0.5 whitespace-nowrap"
          >
            <span>{chip.label}</span>
            <X size={14} className="text-[#3c2a17]/65" />
          </button>
        ))}
      </div>
      {chips.length > 0 && (
        <button
          type="button"
          onClick={onClearAll}
          className="border-none bg-transparent text-[#b5976a] font-semibold cursor-pointer underline decoration-dotted underline-offset-4 hover:opacity-70 whitespace-nowrap"
        >
          Clear All
        </button>
      )}
    </div>
  );
};

export default ActiveFilters;