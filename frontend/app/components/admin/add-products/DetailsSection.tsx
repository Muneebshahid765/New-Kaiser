// features/products/components/sections/DetailsSection.tsx
import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import {
  ChevronDown,
  ChevronRight,
  Sparkles,
  Lightbulb,
  CheckCircle,
  BookOpen,
  Trash2,
  Plus,
  Leaf,
  LineChart,
  BadgePercent,
} from "lucide-react";
import type { ProductFormData } from "@/app/features/products/schemas/product.schema";

interface DetailsSectionProps {
  isOpen: boolean;
  onToggle: () => void;
}

const DetailsSection: React.FC<DetailsSectionProps> = ({
  isOpen,
  onToggle,
}) => {
  const { control, register } = useFormContext<ProductFormData>();

  // Field Arrays linked directly to React Hook Form
  const labelsFA = useFieldArray({ control, name: "labels" });
  const featuresFA = useFieldArray({ control, name: "features" as any });
  const highlightsFA = useFieldArray({ control, name: "highlights" as any });
  const ingredientsFA = useFieldArray({ control, name: "ingredients" });
  const nutritionFactsFA = useFieldArray({ control, name: "nutritionFacts" });
  const benefitsFA = useFieldArray({ control, name: "benefits" });
  const faqsFA = useFieldArray({ control, name: "faqs" });

  return (
    <div
      className={`bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden transition-shadow ${isOpen ? "shadow-md" : ""}`}
    >
      {/* Header */}
      <div
        className={`flex justify-between items-center px-6 py-5 cursor-pointer transition-colors select-none border-b border-[#e2e8f0] ${isOpen ? "bg-gradient-to-r from-[#eff6ff] to-[#dbeafe] border-b-2 border-[#3b82f6]" : "bg-white hover:bg-[#f8fafc]"}`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-[#f1f5f9] rounded-[10px]">
            <Sparkles size={20} className="text-[#64748b]" />
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-[#0f172a] m-0 leading-tight">
              Product Details
            </h3>
            <p className="text-[13px] text-[#64748b] m-0 mt-0.5">
              Labels, features, benefits, FAQs & usage
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="w-8 h-8 border border-[#e2e8f0] bg-white rounded-[10px] cursor-pointer flex items-center justify-center text-[#64748b] transition-colors hover:bg-[#f1f5f9]"
          >
            {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </div>

      {/* Body */}
      {isOpen && (
        <div className="p-6 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-6">
            {/* Labels */}
            <div>
              <h4 className="text-[15px] font-bold text-[#0f172a] flex items-center gap-2 mb-3">
                <BadgePercent size={18} className="text-[#64748b]" />
                Product Labels
              </h4>
              {labelsFA.fields.length === 0 ? (
                <div className="text-center py-6 bg-[#f8fafc] rounded-[10px] border-2 border-dashed border-[#e2e8f0]">
                  <p className="text-[13px] text-[#94a3b8]">
                    No labels added yet
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 mb-3">
                  {labelsFA.fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-3 p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px]"
                    >
                      <div className="flex-1 flex gap-3">
                        <input
                          type="text"
                          {...register(`labels.${index}.text`)}
                          className="flex-1 px-3 py-2 border-2 border-[#e2e8f0] rounded-[8px] text-[14px] focus:outline-none focus:border-[#3b82f6]"
                          placeholder="e.g., Best Seller"
                        />
                        <select
                          {...register(`labels.${index}.variant`)}
                          className="px-3 py-2 border-2 border-[#e2e8f0] rounded-[8px] text-[14px] focus:outline-none focus:border-[#3b82f6] bg-white"
                        >
                          <option value="primary">Primary</option>
                          <option value="secondary">Secondary</option>
                          <option value="accent">Accent</option>
                          <option value="purple">Purple</option>
                          <option value="green">Green</option>
                          <option value="blue">Blue</option>
                          <option value="orange">Orange</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => labelsFA.remove(index)}
                        className="p-2 bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5] rounded-[8px] hover:bg-[#fecaca]"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() =>
                  labelsFA.append({
                    text: "",
                    variant: "primary",
                    sortOrder: labelsFA.fields.length,
                  })
                }
                className="w-full py-2.5 bg-white text-[#3b82f6] border-2 border-dashed border-[#3b82f6] rounded-[10px] cursor-pointer text-[14px] font-semibold hover:bg-[#eff6ff] flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add Label
              </button>
            </div>

            {/* Features */}
            <div>
              <h4 className="text-[15px] font-bold text-[#0f172a] flex items-center gap-2 mb-3">
                <Sparkles size={18} className="text-[#64748b]" />
                Features
              </h4>
              {featuresFA.fields.length === 0 ? (
                <div className="text-center py-6 bg-[#f8fafc] rounded-[10px] border-2 border-dashed border-[#e2e8f0]">
                  <p className="text-[13px] text-[#94a3b8]">
                    No features added yet
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mb-3">
                  {featuresFA.fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-3">
                      <input
                        type="text"
                        {...register(`features.${index}` as any)}
                        className="flex-1 px-3 py-2.5 border-2 border-[#e2e8f0] rounded-[8px] text-[14px] focus:outline-none focus:border-[#3b82f6]"
                        placeholder="Enter feature"
                      />
                      <button
                        type="button"
                        onClick={() => featuresFA.remove(index)}
                        className="p-2.5 bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5] rounded-[8px] hover:bg-[#fecaca]"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => featuresFA.append("" as any)}
                className="w-full py-2.5 bg-white text-[#3b82f6] border-2 border-dashed border-[#3b82f6] rounded-[10px] cursor-pointer text-[14px] font-semibold hover:bg-[#eff6ff] flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add Feature
              </button>
            </div>

            {/* Highlights */}
            <div>
              <h4 className="text-[15px] font-bold text-[#0f172a] flex items-center gap-2 mb-3">
                <Lightbulb size={18} className="text-[#64748b]" />
                Highlights
              </h4>
              {highlightsFA.fields.length === 0 ? (
                <div className="text-center py-6 bg-[#f8fafc] rounded-[10px] border-2 border-dashed border-[#e2e8f0]">
                  <p className="text-[13px] text-[#94a3b8]">
                    No highlights added yet
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mb-3">
                  {highlightsFA.fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-3">
                      <input
                        type="text"
                        {...register(`highlights.${index}` as any)}
                        className="flex-1 px-3 py-2.5 border-2 border-[#e2e8f0] rounded-[8px] text-[14px] focus:outline-none focus:border-[#3b82f6]"
                        placeholder="Enter highlight"
                      />
                      <button
                        type="button"
                        onClick={() => highlightsFA.remove(index)}
                        className="p-2.5 bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5] rounded-[8px] hover:bg-[#fecaca]"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => highlightsFA.append("" as any)}
                className="w-full py-2.5 bg-white text-[#3b82f6] border-2 border-dashed border-[#3b82f6] rounded-[10px] cursor-pointer text-[14px] font-semibold hover:bg-[#eff6ff] flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add Highlight
              </button>
            </div>

            {/* Ingredients */}
            <div>
              <h4 className="text-[15px] font-bold text-[#0f172a] flex items-center gap-2 mb-3">
                <Leaf size={18} className="text-[#64748b]" />
                Ingredients
              </h4>
              {ingredientsFA.fields.length === 0 ? (
                <div className="text-center py-6 bg-[#f8fafc] rounded-[10px] border-2 border-dashed border-[#e2e8f0]">
                  <p className="text-[13px] text-[#94a3b8]">
                    No ingredients added yet
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 mb-3">
                  {ingredientsFA.fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-3 p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px]"
                    >
                      <div className="flex-1 flex gap-3">
                        <input
                          type="text"
                          {...register(`ingredients.${index}.name`)}
                          className="flex-1 px-3 py-2 border-2 border-[#e2e8f0] rounded-[8px] text-[14px] focus:outline-none focus:border-[#3b82f6]"
                          placeholder="e.g., Carbonated Water"
                        />
                        <input
                          type="text"
                          {...register(`ingredients.${index}.description`)}
                          className="flex-1 px-3 py-2 border-2 border-[#e2e8f0] rounded-[8px] text-[14px] focus:outline-none focus:border-[#3b82f6]"
                          placeholder="Optional"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => ingredientsFA.remove(index)}
                        className="p-2 bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5] rounded-[8px] hover:bg-[#fecaca]"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
               onClick={() =>
  ingredientsFA.append({
    name: "",
    description: "",
    sortOrder: ingredientsFA.fields.length,
  })
}
                className="w-full py-2.5 bg-white text-[#3b82f6] border-2 border-dashed border-[#3b82f6] rounded-[10px] cursor-pointer text-[14px] font-semibold hover:bg-[#eff6ff] flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add Ingredient
              </button>
            </div>

            {/* Nutrition Facts */}
            <div>
              <h4 className="text-[15px] font-bold text-[#0f172a] flex items-center gap-2 mb-3">
                <LineChart size={18} className="text-[#64748b]" />
                Nutrition Facts
              </h4>
              {nutritionFactsFA.fields.length === 0 ? (
                <div className="text-center py-6 bg-[#f8fafc] rounded-[10px] border-2 border-dashed border-[#e2e8f0]">
                  <p className="text-[13px] text-[#94a3b8]">
                    No nutrition facts added yet
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 mb-3">
                  {nutritionFactsFA.fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px]"
                    >
                      <div className="flex flex-wrap gap-3">
                        <div className="flex-1 min-w-[120px]">
                          <label className="text-[12px] font-semibold text-[#64748b] block mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            {...register(`nutritionFacts.${index}.name`)}
                            className="w-full px-3 py-2 border-2 border-[#e2e8f0] rounded-[8px] text-[14px] focus:outline-none focus:border-[#3b82f6]"
                            placeholder="Sodium"
                          />
                        </div>
                        <div className="w-[100px]">
                          <label className="text-[12px] font-semibold text-[#64748b] block mb-1">
                            Value
                          </label>
                          <input
                            type="text"
                            {...register(`nutritionFacts.${index}.value`)}
                            className="w-full px-3 py-2 border-2 border-[#e2e8f0] rounded-[8px] text-[14px] focus:outline-none focus:border-[#3b82f6]"
                            placeholder="500"
                          />
                        </div>
                        <div className="w-[100px]">
                          <label className="text-[12px] font-semibold text-[#64748b] block mb-1">
                            Unit
                          </label>
                          <input
                            type="text"
                            {...register(`nutritionFacts.${index}.unit`)}
                            className="w-full px-3 py-2 border-2 border-[#e2e8f0] rounded-[8px] text-[14px] focus:outline-none focus:border-[#3b82f6]"
                            placeholder="mg"
                          />
                        </div>
                        <div className="flex-1 min-w-[120px]">
                          <label className="text-[12px] font-semibold text-[#64748b] block mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            {...register(`nutritionFacts.${index}.description`)}
                            className="w-full px-3 py-2 border-2 border-[#e2e8f0] rounded-[8px] text-[14px] focus:outline-none focus:border-[#3b82f6]"
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => nutritionFactsFA.remove(index)}
                        className="mt-2 px-3 py-1.5 bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5] rounded-[8px] text-[13px] hover:bg-[#fecaca] flex items-center gap-2"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                 onClick={() =>
  nutritionFactsFA.append({
    name: "",
    value: "",
    unit: "",
    description: "",
    sortOrder: nutritionFactsFA.fields.length,
  })
}
                className="w-full py-2.5 bg-white text-[#3b82f6] border-2 border-dashed border-[#3b82f6] rounded-[10px] cursor-pointer text-[14px] font-semibold hover:bg-[#eff6ff] flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add Nutrition Fact
              </button>
            </div>

            {/* Benefits */}
            <div>
              <h4 className="text-[15px] font-bold text-[#0f172a] flex items-center gap-2 mb-3">
                <CheckCircle size={18} className="text-[#64748b]" />
                Product Benefits
              </h4>
              {benefitsFA.fields.length === 0 ? (
                <div className="text-center py-6 bg-[#f8fafc] rounded-[10px] border-2 border-dashed border-[#e2e8f0]">
                  <p className="text-[13px] text-[#94a3b8]">
                    No benefits added yet
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 mb-3">
                  {benefitsFA.fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px]"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <input
                          type="text"
                          {...register(`benefits.${index}.icon`)}
                          className="w-[50px] px-2 py-2 border-2 border-[#e2e8f0] rounded-[8px] text-[20px] text-center focus:outline-none focus:border-[#3b82f6]"
                          placeholder="✓"
                        />
                        <input
                          type="text"
                          {...register(`benefits.${index}.title`)}
                          className="flex-1 px-3 py-2 border-2 border-[#e2e8f0] rounded-[8px] text-[14px] focus:outline-none focus:border-[#3b82f6]"
                          placeholder="Benefit title"
                        />
                        <button
                          type="button"
                          onClick={() => benefitsFA.remove(index)}
                          className="p-2 bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5] rounded-[8px] hover:bg-[#fecaca]"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <textarea
                        {...register(`benefits.${index}.description`)}
                        className="w-full px-3 py-2 border-2 border-[#e2e8f0] rounded-[8px] text-[14px] resize-y focus:outline-none focus:border-[#3b82f6]"
                        rows={2}
                        placeholder="Benefit description"
                      />
                      <input
                        type="url"
                        {...register(`benefits.${index}.learnMoreUrl`)}
                        className="w-full mt-2 px-3 py-2 border-2 border-[#e2e8f0] rounded-[8px] text-[14px] focus:outline-none focus:border-[#3b82f6]"
                        placeholder="Learn more URL (optional)"
                      />
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() =>
  benefitsFA.append({
    icon: "✓",
    title: "",
    description: "",
    learnMoreUrl: "",
    sortOrder: benefitsFA.fields.length,
  })
}
                className="w-full py-2.5 bg-white text-[#3b82f6] border-2 border-dashed border-[#3b82f6] rounded-[10px] cursor-pointer text-[14px] font-semibold hover:bg-[#eff6ff] flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add Benefit
              </button>
            </div>

            {/* FAQs */}
            <div>
              <h4 className="text-[15px] font-bold text-[#0f172a] flex items-center gap-2 mb-3">
                <Sparkles size={18} className="text-[#64748b]" />
                FAQs
              </h4>
              {faqsFA.fields.length === 0 ? (
                <div className="text-center py-6 bg-[#f8fafc] rounded-[10px] border-2 border-dashed border-[#e2e8f0]">
                  <p className="text-[13px] text-[#94a3b8]">
                    No FAQs added yet
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 mb-3">
                  {faqsFA.fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px]"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[13px] font-semibold text-[#64748b]">
                          Question
                        </label>
                        <button
                          type="button"
                          onClick={() => faqsFA.remove(index)}
                          className="p-1.5 bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5] rounded-[6px] hover:bg-[#fecaca]"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <input
                        type="text"
                        {...register(`faqs.${index}.question`)}
                        className="w-full mb-3 px-3 py-2 border-2 border-[#e2e8f0] rounded-[8px] text-[14px] focus:outline-none focus:border-[#3b82f6]"
                        placeholder="Enter question"
                      />
                      <label className="text-[13px] font-semibold text-[#64748b] block mb-1">
                        Answer
                      </label>
                      <textarea
                        {...register(`faqs.${index}.answer`)}
                        className="w-full px-3 py-2 border-2 border-[#e2e8f0] rounded-[8px] text-[14px] resize-y focus:outline-none focus:border-[#3b82f6]"
                        rows={3}
                        placeholder="Enter answer"
                      />
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() =>
  faqsFA.append({
    question: "",
    answer: "",
    sortOrder: faqsFA.fields.length,
  })
}
                className="w-full py-2.5 bg-white text-[#3b82f6] border-2 border-dashed border-[#3b82f6] rounded-[10px] cursor-pointer text-[14px] font-semibold hover:bg-[#eff6ff] flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add FAQ
              </button>
            </div>

            {/* Usage Instructions */}
            <div>
              <h4 className="text-[15px] font-bold text-[#0f172a] flex items-center gap-2 mb-3">
                <BookOpen size={18} className="text-[#64748b]" />
                Usage Instructions
              </h4>
              <textarea
                {...register("usageInstructions")}
                className="w-full px-4 py-3 border-2 border-[#e2e8f0] rounded-[10px] text-[14px] resize-y min-h-[120px] focus:outline-none focus:border-[#3b82f6]"
                rows={5}
                placeholder="Provide detailed usage instructions..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailsSection;
