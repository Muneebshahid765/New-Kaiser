"use client"
import React, { useState, memo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Plus, Edit, Trash2, Loader2, Star } from "lucide-react";

import {
  useBuyerAddresses,
  useCreateBuyerAddress,
  useUpdateBuyerAddress,
  useSetDefaultBuyerAddress,
  useDeleteBuyerAddress,
} from "@/app/features/buyer/hooks/buyer-address.hooks";
import {
  CreateBuyerAddressSchema,
  type CreateBuyerAddressPayload
} from "@/app/features/buyer/schemas/buyer-address.schema";
import { BuyerAddress } from "@/app/features/buyer/types/buyer-address-response.types";
// import { Skeleton, SkeletonCard } from "./SkeletonLoader";

const DEFAULT_FORM_VALUES: CreateBuyerAddressPayload = {
  label: "Home",
  fullName: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Pakistan",
  isDefault: false,
};

// Item component (Re-render isolation)
const AddressCard = memo(
  ({
    address,
    onEdit,
    onDelete,
    onSetDefault,
    isPending,
  }: {
    address: BuyerAddress;
    onEdit: (address: BuyerAddress) => void;
    onDelete: (id: string) => void;
    onSetDefault: (id: string) => void;
    isPending: boolean;
  }) => (
    <div
      className={`bg-white border-2 rounded-2xl p-6 transition-all duration-200 hover:shadow-md ${
        address.isDefault ? "border-teal-500 bg-teal-50/10" : "border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
        <div>
          <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">
            {address.label || "Saved Address"}
          </p>
          <h3 className="text-lg font-bold text-gray-900">{address.fullName || "No Name"}</h3>
        </div>
        {address.isDefault && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-500 text-white text-xs font-bold rounded-full">
            <Star size={14} className="fill-current" /> Default
          </span>
        )}
      </div>

      <div className="mb-4 text-sm text-gray-600 leading-relaxed">
        <p>{address.address1}</p>
        {address.address2 && <p>{address.address2}</p>}
        <p>{address.city}, {address.state}</p>
        <p>{address.postalCode}, {address.country}</p>
        {address.phone && <p className="text-gray-400 mt-2">Phone: {address.phone}</p>}
      </div>

      <div className="flex flex-wrap gap-2.5 pt-4 border-t border-gray-100">
        {!address.isDefault && (
          <button
            type="button"
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-teal-600 border border-teal-200 rounded-lg hover:bg-teal-50 disabled:opacity-50"
            onClick={() => onSetDefault(address.id)}
          >
            <Star size={16} /> Make Default
          </button>
        )}
        <button
          type="button"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          onClick={() => onEdit(address)}
        >
          <Edit size={16} /> Edit
        </button>
        <button
          type="button"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
          onClick={() => onDelete(address.id)}
        >
          <Trash2 size={16} /> Delete
        </button>
      </div>
    </div>
  )
);
AddressCard.displayName = "AddressCard";

export default function BuyerAddresses() {
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: response, isLoading } = useBuyerAddresses();
  const createMutation = useCreateBuyerAddress();
  const updateMutation = useUpdateBuyerAddress();
  const setDefaultMutation = useSetDefaultBuyerAddress();
  const deleteMutation = useDeleteBuyerAddress();

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    setDefaultMutation.isPending ||
    deleteMutation.isPending;

  const addresses = response?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateBuyerAddressPayload>({
    resolver: zodResolver(CreateBuyerAddressSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const onSubmit = (data: CreateBuyerAddressPayload) => {
    if (editingId) {
      updateMutation.mutate(
        { id: editingId, dto: data },
        { onSuccess: handleCancelEdit }
      );
    } else {
      createMutation.mutate(data, { onSuccess: handleCancelEdit });
    }
  };

  const handleEdit = (address: BuyerAddress) => {
    setEditingId(address.id);
    reset({
      label: address.label || "Home",
      fullName: address.fullName || "",
      phone: address.phone || "",
      address1: address.address1 || "",
      address2: address.address2 || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postalCode || "",
      country: address.country || "Pakistan",
      isDefault: address.isDefault || false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSetDefault = (id: string) => {
    setDefaultMutation.mutate(id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    reset(DEFAULT_FORM_VALUES);
  };

  if (isLoading) {
    // return (
    //   <div className="font-sans max-w-7xl mx-auto p-4">
    //     <div className="mb-8">
    //       <Skeleton width="180px" height="26px" />
    //       <Skeleton width="260px" height="13px" style={{ marginTop: "8px" }} />
    //     </div>
    //     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    //       <SkeletonCard>
    //         {[1, 2, 3].map((i) => (
    //           <Skeleton key={i} width="100%" height="38px" style={{ marginBottom: "12px" }} />
    //         ))}
    //       </SkeletonCard>
    //     </div>
    //   </div>
    // );
  }

  return (
    <div className="font-sans max-w-7xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Saved Addresses</h1>
        <p className="text-sm text-gray-500">Manage your shipping and billing addresses</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-6 items-start">
        {/* ADDRESS LIST */}
        <section className="min-h-[400px]">
          {addresses.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center bg-white border border-dashed border-gray-200 rounded-2xl min-h-[400px]">
              <MapPin size={40} className="text-gray-400 opacity-50 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No address saved yet</h3>
              <p className="text-sm text-gray-500 max-w-xs">Use the form to add an address for faster checkout.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSetDefault={handleSetDefault}
                  isPending={isPending}
                />
              ))}
            </div>
          )}
        </section>

        {/* ADDRESS FORM */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-5">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-100">
            <MapPin size={20} className="text-teal-500" />
            <h2 className="text-lg font-bold text-gray-900">
              {editingId ? "Update Address" : "Add New Address"}
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-semibold text-gray-600">Label</label>
                <input
                  {...register("label")}
                  className="w-full mt-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-teal-500 outline-none"
                />
                {errors.label && <p className="text-xs text-red-500 mt-1">{errors.label.message}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Full Name</label>
                <input
                  {...register("fullName")}
                  className="w-full mt-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-teal-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">Phone</label>
              <input
                {...register("phone")}
                className="w-full mt-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">Address Line 1</label>
              <input
                {...register("address1")}
                className="w-full mt-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-teal-500 outline-none"
              />
              {errors.address1 && <p className="text-xs text-red-500 mt-1">{errors.address1.message}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">Address Line 2</label>
              <input
                {...register("address2")}
                className="w-full mt-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-teal-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-semibold text-gray-600">City</label>
                <input
                  {...register("city")}
                  className="w-full mt-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-teal-500 outline-none"
                />
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">State/Region</label>
                <input
                  {...register("state")}
                  className="w-full mt-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-teal-500 outline-none"
                />
                {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-semibold text-gray-600">Postal Code</label>
                <input
                  {...register("postalCode")}
                  className="w-full mt-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-teal-500 outline-none"
                />
                {errors.postalCode && <p className="text-xs text-red-500 mt-1">{errors.postalCode.message}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Country</label>
                <input
                  {...register("country")}
                  className="w-full mt-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-teal-500 outline-none"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 px-3 py-2.5 bg-teal-50/50 border border-teal-200 rounded-lg cursor-pointer">
              <input type="checkbox" {...register("isDefault")} className="accent-teal-500" />
              <span className="text-xs font-medium text-gray-900">Set as default address</span>
            </label>

            <div className="flex gap-3 mt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-teal-500 rounded-lg hover:bg-teal-600 disabled:opacity-70"
              >
                {isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={18} />}
                {editingId ? "Update Address" : "Save Address"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}