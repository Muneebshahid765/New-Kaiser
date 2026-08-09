"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BulkUpdateProductSchema,
  ProductStatusEnum,
  LabelVariantEnum,
  type BulkUpdateProductFormData,
} from "@/app/features/products/schemas/product.schema";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Button } from "../../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

// ─── Icons ────────────────────────────────────────────────────────────────────
import {
  X,
  Package,
  Tag,
  Truck,
  Settings2,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProductIds: string[];
  /** Categories from Prisma — id is UUID */
  categories: Array<{ id: string; name: string }>;
  onSave: (data: BulkUpdateProductFormData) => Promise<void>;
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────
function Section({
  icon: Icon,
  title,
  children,
  defaultOpen = true,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="rounded-xl border border-stone-200 dark:border-stone-700/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-stone-50 dark:bg-stone-800/60 hover:bg-amber-50/60 dark:hover:bg-stone-700/40 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-200">
          <Icon className="size-4 text-amber-600" />
          {title}
        </span>
        {open ? (
          <ChevronUp className="size-4 text-stone-400" />
        ) : (
          <ChevronDown className="size-4 text-stone-400" />
        )}
      </button>
      {open && (
        <div className="px-4 py-4 space-y-4 bg-white dark:bg-stone-900">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── StringArray Editor (features / highlights / sharedFeatures) ──────────────
function StringArrayField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string[] | undefined;
  onChange: (val: string[]) => void;
  placeholder: string;
}) {
  const items = value ?? [];
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
        {label}
      </p>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <Input
              value={item}
              onChange={(e) => {
                const next = [...items];
                next[idx] = e.target.value;
                onChange(next);
              }}
              placeholder={placeholder}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onChange(items.filter((_, i) => i !== idx))}
              className="shrink-0 text-rose-400 hover:text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...items, ""])}
          className="gap-1.5 text-amber-700 border-amber-300 hover:bg-amber-50"
        >
          <Plus className="size-3.5" />
          Add {label}
        </Button>
      </div>
    </div>
  );
}

// ─── Label Variant Badge ──────────────────────────────────────────────────────
const VARIANT_COLORS: Record<string, string> = {
  primary:   "bg-amber-100 text-amber-800 border-amber-300",
  secondary: "bg-stone-100 text-stone-700 border-stone-300",
  accent:    "bg-purple-100 text-purple-700 border-purple-300",
  purple:    "bg-violet-100 text-violet-700 border-violet-300",
  green:     "bg-green-100 text-green-700 border-green-300",
  blue:      "bg-blue-100 text-blue-700 border-blue-300",
  orange:    "bg-orange-100 text-orange-700 border-orange-300",
};

// ─── Main Modal ───────────────────────────────────────────────────────────────
export function BulkEditModal({
  isOpen,
  onClose,
  selectedProductIds,
  categories,
  onSave,
}: BulkEditModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const form = useForm<BulkUpdateProductFormData>({
    resolver: zodResolver(BulkUpdateProductSchema),
    defaultValues: {
      productIds: selectedProductIds,
      updates: {},
    },
  });

  // Sync selected IDs when prop changes
  React.useEffect(() => {
    form.setValue("productIds", selectedProductIds);
  }, [selectedProductIds, form]);

  // Reset success state on open
  React.useEffect(() => {
    if (isOpen) setSuccess(false);
  }, [isOpen]);

  // ESC key to close
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isSubmitting, onClose]);

  if (!isOpen) return null;

  // ── Submit ──────────────────────────────────────────────────────────────────
  const onSubmit = async (data: BulkUpdateProductFormData) => {
    try {
      setIsSubmitting(true);

      // Strip undefined values so backend only receives filled fields
      const cleanUpdates = Object.fromEntries(
        Object.entries(data.updates).filter(
          ([, v]) => v !== undefined && v !== null && v !== ""
        )
      );

      await onSave({ ...data, updates: cleanUpdates as typeof data.updates });
      setSuccess(true);

      setTimeout(() => {
        form.reset({ productIds: selectedProductIds, updates: {} });
        onClose();
      }, 1200);
    } catch (error) {
      console.error("Bulk update failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Watched arrays for custom editors ──────────────────────────────────────
  const watchedFeatures       = form.watch("updates.features");
  const watchedHighlights     = form.watch("updates.highlights");
  const watchedSharedFeatures = form.watch("updates.sharedFeatures");
  const watchedLabels         = form.watch("updates.labels");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && !isSubmitting && onClose()}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-white dark:bg-stone-950">
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Settings2 className="size-4 text-amber-600" />
              Bulk Edit Products
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              <span className="font-semibold text-amber-600">
                {selectedProductIds.length}
              </span>{" "}
              product{selectedProductIds.length !== 1 ? "s" : ""} selected ·
              Only filled fields will be updated
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-stone-400 hover:text-stone-700"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* ── Success banner ────────────────────────────────────────────────── */}
        {success && (
          <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
            <CheckCircle2 className="size-4 shrink-0" />
            Successfully updated {selectedProductIds.length} product
            {selectedProductIds.length !== 1 ? "s" : ""}!
          </div>
        )}

        {/* ── Body ──────────────────────────────────────────────────────────── */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="p-5 space-y-3 overflow-y-auto flex-1">

              {/* Validation errors */}
              {form.formState.errors.productIds && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-xs font-medium">
                  <AlertCircle className="size-4 shrink-0" />
                  {form.formState.errors.productIds.message}
                </div>
              )}
              {form.formState.errors.updates?.root && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-xs font-medium">
                  <AlertCircle className="size-4 shrink-0" />
                  {form.formState.errors.updates.root.message}
                </div>
              )}

              {/* ─────────────────── SECTION 1: Pricing & Stock ─────────────── */}
              <Section icon={Package} title="Pricing & Stock">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Price */}
                  <FormField
                    control={form.control}
                    name="updates.price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (PKR)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            placeholder="Leave blank = no change"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Original Price */}
                  <FormField
                    control={form.control}
                    name="updates.originalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Original / MRP Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            placeholder="Leave blank = no change"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Stock Quantity */}
                  <FormField
                    control={form.control}
                    name="updates.stockQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            placeholder="Leave blank = no change"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Status */}
                  <FormField
                    control={form.control}
                    name="updates.status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? ""}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full h-10 rounded-lg border-stone-300 dark:border-stone-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20">
                              <SelectValue placeholder="Select status..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ProductStatusEnum.options.map((status) => (
                              <SelectItem key={status} value={status}>
                                <span className="flex items-center gap-2 capitalize">
                                  <span
                                    className={`size-2 rounded-full ${
                                      status === "active"
                                        ? "bg-green-500"
                                        : status === "draft"
                                        ? "bg-amber-400"
                                        : "bg-stone-400"
                                    }`}
                                  />
                                  {status}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Section>

              {/* ─────────────────── SECTION 2: Category ───────────────────── */}
              <Section icon={Tag} title="Category" defaultOpen={true}>
                {/*
                  NOTE: Prisma schema uses categoryId (UUID).
                  Express backend wala 'category' field Mongoose ObjectId tha.
                  Ab NestJS + Prisma ke saath 'categoryId' UUID use ho raha hai.
                */}
                <FormField
                  control={form.control}
                  name="updates.categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full h-10 rounded-lg border-stone-300 dark:border-stone-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20">
                            <SelectValue placeholder="Select category..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Section>

              {/* ─────────────────── SECTION 3: Delivery ───────────────────── */}
              <Section icon={Truck} title="Delivery & Insurance" defaultOpen={false}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Delivery Charges */}
                  <FormField
                    control={form.control}
                    name="updates.deliveryCharges"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Charges (PKR)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            placeholder="Leave blank = no change"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Delivery Rule */}
                  <FormField
                    control={form.control}
                    name="updates.deliveryRule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Rule</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='e.g. "Free above Rs.2000"'
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Insurance Details */}
                <FormField
                  control={form.control}
                  name="updates.insuranceDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Details</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Insurance / warranty details..."
                          rows={2}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Section>

              {/* ─────────────────── SECTION 4: Features & Highlights ──────── */}
              {/*
                Prisma mein features & highlights String[] hain on Product model.
                NestJS bulkUpdate mein scalarUpdates ke andar yeh directly
                tx.product.updateMany se update ho jaate hain — array replace hoti hai.
              */}
              <Section icon={Settings2} title="Features & Highlights" defaultOpen={false}>

                {/* Features Array */}
                <FormField
                  control={form.control}
                  name="updates.features"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <StringArrayField
                          label="Features"
                          value={watchedFeatures}
                          onChange={(val) => field.onChange(val)}
                          placeholder='e.g. "100% Natural Ingredients"'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Highlights Array */}
                <FormField
                  control={form.control}
                  name="updates.highlights"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <StringArrayField
                          label="Highlights"
                          value={watchedHighlights}
                          onChange={(val) => field.onChange(val)}
                          placeholder='e.g. "Best Seller"'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Shared Features Array */}
                <FormField
                  control={form.control}
                  name="updates.sharedFeatures"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <StringArrayField
                          label="Shared Features"
                          value={watchedSharedFeatures}
                          onChange={(val) => field.onChange(val)}
                          placeholder='e.g. "Free Returns"'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Usage Instructions */}
                <FormField
                  control={form.control}
                  name="updates.usageInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usage Instructions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="How to use this product..."
                          rows={2}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Section>

              {/* ─────────────────── SECTION 5: Labels ─────────────────────── */}
              {/*
                Prisma: ProductLabel is a separate relation table.
                NestJS bulkUpdate: deleteMany + createMany per product (relational update).
                Yeh labels REPLACE ho jaate hain — existing labels delete hokar naye add hote hain.
              */}
              <Section icon={Tag} title="Product Labels (Replaces Existing)" defaultOpen={false}>
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  ⚠️ Labels set karne se selected products ke <strong>existing labels replace</strong> ho
                  jaayenge. Blank chhodo agar labels change nahi karni.
                </p>
                <div className="space-y-3">
                  {(watchedLabels ?? []).map((label, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-[1fr_auto_auto] gap-2 items-end"
                    >
                      <FormField
                        control={form.control}
                        name={`updates.labels.${idx}.text`}
                        render={({ field }) => (
                          <FormItem>
                            {idx === 0 && <FormLabel>Label Text</FormLabel>}
                            <FormControl>
                              <Input
                                placeholder='e.g. "New Arrival"'
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`updates.labels.${idx}.variant`}
                        render={({ field }) => (
                          <FormItem>
                            {idx === 0 && <FormLabel>Variant</FormLabel>}
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? "primary"}
                            >
                              <FormControl>
                                <SelectTrigger className="w-28 h-10 rounded-lg border-stone-300 dark:border-stone-700">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {LabelVariantEnum.options.map((v) => (
                                  <SelectItem key={v} value={v}>
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-xs font-medium border capitalize ${VARIANT_COLORS[v]}`}
                                    >
                                      {v}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="mb-0.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                        onClick={() => {
                          const curr = form.getValues("updates.labels") ?? [];
                          form.setValue(
                            "updates.labels",
                            curr.filter((_, i) => i !== idx)
                          );
                        }}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-amber-700 border-amber-300 hover:bg-amber-50"
                    onClick={() => {
                      const curr = form.getValues("updates.labels") ?? [];
                      form.setValue("updates.labels", [
                        ...curr,
                        { text: "", variant: "primary", sortOrder: curr.length },
                      ]);
                    }}
                  >
                    <Plus className="size-3.5" />
                    Add Label
                  </Button>
                </div>
              </Section>

              {/* ─────────────────── SECTION 6: Description & Notes ─────────── */}
              <Section icon={Settings2} title="Description & Notes" defaultOpen={false}>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="updates.description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Product description (min 10 chars)..."
                          rows={3}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Admin Notes */}
                <FormField
                  control={form.control}
                  name="updates.adminNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Notes (Internal)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Internal notes — not visible to buyers..."
                          rows={2}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Section>
            </div>

            {/* ── Footer ────────────────────────────────────────────────────── */}
            <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 flex items-center justify-between gap-3">
              <p className="text-xs text-stone-400 hidden sm:block">
                Only fields you fill in will be changed.
              </p>
              <div className="flex gap-2 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={isSubmitting}
                  disabled={isSubmitting || success}
                >
                  {success ? "Saved!" : "Apply to All"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}