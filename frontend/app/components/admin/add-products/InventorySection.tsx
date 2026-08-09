// features/products/components/sections/InventorySection.tsx
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronDown, ChevronRight, Package, Truck, Shield } from 'lucide-react';
import type { ProductFormData } from '@/app/features/products/schemas/product.schema';

interface InventorySectionProps {
  isOpen: boolean;
  onToggle: () => void;
}

const InventorySection: React.FC<InventorySectionProps> = ({ isOpen, onToggle }) => {
  const { register, formState: { errors } } = useFormContext<ProductFormData>();

  return (
    <div className={`bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden transition-shadow ${isOpen ? 'shadow-md' : ''}`}>
      {/* Header */}
      <div
        className={`flex justify-between items-center px-6 py-5 cursor-pointer transition-colors select-none border-b border-[#e2e8f0] ${isOpen ? 'bg-gradient-to-r from-[#eff6ff] to-[#dbeafe] border-b-2 border-[#3b82f6]' : 'bg-white hover:bg-[#f8fafc]'}`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-[#f1f5f9] rounded-[10px]">
            <Package size={20} className="text-[#64748b]" />
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-[#0f172a] m-0 leading-tight">Inventory & Delivery</h3>
            <p className="text-[13px] text-[#64748b] m-0 mt-0.5">Stock, shipping, and insurance details</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="w-8 h-8 border border-[#e2e8f0] bg-white rounded-[10px] cursor-pointer flex items-center justify-center text-[#64748b] transition-colors hover:bg-[#f1f5f9]">
            {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </div>

      {/* Body */}
      {isOpen && (
        <div className="p-6 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Stock Quantity */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-[#0f172a]">Stock Quantity</label>
              <input
                type="number"
                min="0"
                {...register("stockQuantity", { valueAsNumber: true })}
                className="w-full px-4 py-3 border-2 border-[#e2e8f0] rounded-[10px] text-[14px] text-[#0f172a] bg-white transition-all focus:outline-none focus:border-[#3b82f6]"
                placeholder="0"
              />
              {errors.stockQuantity && <p className="text-red-500 text-[12px] mt-1">{errors.stockQuantity.message}</p>}
            </div>

            {/* Delivery Charges */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-[#0f172a] after:content-['*'] after:text-[#ef4444] after:ml-0.5">
                Delivery Charges ($)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-[#64748b]">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("deliveryCharges", { valueAsNumber: true })}
                  className="w-full pl-8 pr-4 py-3 border-2 border-[#e2e8f0] rounded-[10px] text-[14px] text-[#0f172a] bg-white transition-all focus:outline-none focus:border-[#3b82f6]"
                  placeholder="0.00"
                />
              </div>
              {errors.deliveryCharges && <p className="text-red-500 text-[12px] mt-1">{errors.deliveryCharges.message}</p>}
            </div>

            {/* Delivery Rules */}
            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-[#0f172a] flex items-center gap-2">
                <Truck size={16} className="text-[#64748b]" />
                Delivery Rules
              </label>
              <textarea
                {...register("deliveryRule")}
                rows={3}
                className="w-full px-4 py-3 border-2 border-[#e2e8f0] rounded-[10px] text-[14px] text-[#0f172a] bg-white transition-all resize-y focus:outline-none focus:border-[#3b82f6]"
                placeholder="e.g., Free delivery within city limits"
              />
            </div>

            {/* Insurance Details */}
            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-[#0f172a] flex items-center gap-2">
                <Shield size={16} className="text-[#64748b]" />
                Insurance Details
              </label>
              <textarea
                {...register("insuranceDetails")}
                rows={3}
                className="w-full px-4 py-3 border-2 border-[#e2e8f0] rounded-[10px] text-[14px] text-[#0f172a] bg-white transition-all resize-y focus:outline-none focus:border-[#3b82f6]"
                placeholder="Shipping insurance details"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventorySection;