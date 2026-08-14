import React from "react";

export const BuyerOrdersSkeleton = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((n) => (
        <div key={n} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div className="h-4 w-32 bg-slate-100 rounded" />
            <div className="h-5 w-20 bg-slate-100 rounded-full" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 w-48 bg-slate-100 rounded" />
              <div className="h-2.5 w-24 bg-slate-100 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};