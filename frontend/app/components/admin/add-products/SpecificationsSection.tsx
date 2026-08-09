// sections/SpecificationsSection.tsx
import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { ChevronDown, ChevronRight, Settings, Trash2, Plus } from 'lucide-react';
import type { ProductFormData } from '@/app/features/products/schemas/product.schema';

interface SpecificationsSectionProps {
  isOpen: boolean;
  onToggle: () => void;
}

const SpecificationsSection: React.FC<SpecificationsSectionProps> = ({ isOpen, onToggle }) => {
  const { control, register } = useFormContext<ProductFormData>();
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "specifications" as never, // cast to never/any based on your schema structure
  });

  return (
    <div className={`bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden transition-shadow ${isOpen ? 'shadow-md' : ''}`}>
      {/* Header */}
      <div
        className={`flex justify-between items-center px-6 py-5 cursor-pointer transition-colors select-none border-b border-[#e2e8f0] ${isOpen ? 'bg-gradient-to-r from-[#eff6ff] to-[#dbeafe] border-b-2 border-[#3b82f6]' : 'bg-white hover:bg-[#f8fafc]'}`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-[#f1f5f9] rounded-[10px]">
            <Settings size={20} className="text-[#64748b]" />
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-[#0f172a] m-0 leading-tight">Specifications</h3>
            <p className="text-[13px] text-[#64748b] m-0 mt-0.5">Technical details and properties</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {fields.length > 0 && (
            <span className="px-3 py-1 bg-[#cffafe] text-[#155e75] text-[12px] font-semibold rounded-full">
              {fields.length} items
            </span>
          )}
          <button type="button" className="w-8 h-8 border border-[#e2e8f0] bg-white rounded-[10px] cursor-pointer flex items-center justify-center text-[#64748b] transition-colors hover:bg-[#f1f5f9]">
            {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </div>

      {/* Body */}
      {isOpen && (
        <div className="p-6 animate-in slide-in-from-top-2 duration-200">
          {fields.length === 0 ? (
            <div className="text-center py-10 bg-[#f8fafc] rounded-[10px] border-2 border-dashed border-[#e2e8f0]">
              <Settings size={40} className="text-[#94a3b8] mx-auto mb-3 opacity-50" />
              <p className="text-[15px] font-semibold text-[#64748b] m-0">No specifications added yet</p>
              <p className="text-[13px] text-[#94a3b8] mt-2">Add technical details like material, weight, dimensions</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mb-5">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-3 p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] hover:border-[#60a5fa] transition-colors">
                  <div className="flex-1 flex gap-3">
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-[13px] font-semibold text-[#64748b]">Name</label>
                      <input
                        type="text"
                        {...register(`specifications.${index}.name` as const)}
                        className="w-full px-4 py-2.5 border-2 border-[#e2e8f0] rounded-[8px] text-[14px] text-[#0f172a] bg-white transition-all focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                        placeholder="e.g., Material"
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-[13px] font-semibold text-[#64748b]">Value</label>
                      <input
                        type="text"
                        {...register(`specifications.${index}.value` as const)}
                        className="w-full px-4 py-2.5 border-2 border-[#e2e8f0] rounded-[8px] text-[14px] text-[#0f172a] bg-white transition-all focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                        placeholder="e.g., Cotton"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="px-3 py-2.5 bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5] rounded-[8px] cursor-pointer transition-colors hover:bg-[#fecaca] flex-shrink-0 mt-[26px]"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => append({ name: '', value: '' } as never)}
            className="w-full py-3 bg-white text-[#3b82f6] border-2 border-dashed border-[#3b82f6] rounded-[10px] cursor-pointer text-[14px] font-semibold transition-colors hover:bg-[#eff6ff] hover:border-[#2563eb] flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add Specification
          </button>
        </div>
      )}
    </div>
  );
};

export default SpecificationsSection;