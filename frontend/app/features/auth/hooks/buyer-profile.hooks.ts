// features/buyer-profile/hooks/buyer-profile.hooks.ts
//
// This supersedes any earlier profile-management.hooks.ts written for this
// app — that file referenced deleteAccount/deleteAccountStatus endpoints
// that don't exist on BuyerProfileController, used the wrong query keys, and
// didn't cover address management at all (the real backend's biggest chunk
// of buyer-profile functionality). Hooks below are built directly off the
// BuyerProfileController/BuyerProfileService code you shared.
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutationWithToast } from "@/hooks/use-mutation-toast";
import { useGetAuth } from "@/context/auth-context";
import {
  getBuyerProfile,
  updateBuyerProfile,
  changeBuyerPassword,
  getBuyerAddresses,
  addBuyerAddress,
  updateBuyerAddress,
  setDefaultBuyerAddress,
  deleteBuyerAddress,
} from "../api/buyer-profile.api";
import type {
  UpdateBuyerProfilePayload,
  ChangeBuyerPasswordPayload,
  CreateAddressPayload,
  UpdateAddressPayload,
} from "../types/buyer-profile.types";
import type {
  BuyerProfileResponse,
  UpdateBuyerProfileResponse,
  BuyerAddress,
  MessageResponse,
} from "../types/buyer-profile-response.types";

// ─── Canonical Query Keys ─────────────────────────────────────────────────────
export const BUYER_PROFILE_KEY = ["buyer-profile"] as const;
export const BUYER_ADDRESSES_KEY = ["buyer-profile", "addresses"] as const;

function useIsBuyerReady() {
  const { data: user, isLoading } = useGetAuth();
  return !!user && !isLoading && user.role === "buyer";
}

// ─── Get Profile (includes addresses) ────────────────────────────────────────
export function useBuyerProfile() {
  const ready = useIsBuyerReady();

  return useQuery<BuyerProfileResponse, Error>({
    queryKey: BUYER_PROFILE_KEY,
    queryFn: getBuyerProfile,
    enabled: ready,
    staleTime: 1_000 * 60 * 10,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

// ─── Update Profile ───────────────────────────────────────────────────────────
export function useUpdateBuyerProfile() {
  const queryClient = useQueryClient();

  return useMutationWithToast<UpdateBuyerProfileResponse, UpdateBuyerProfilePayload>(
    updateBuyerProfile,
    {
      successMsg: "Profile updated successfully.",
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: BUYER_PROFILE_KEY });
      },
    },
  );
}

// ─── Change Password ──────────────────────────────────────────────────────────
export function useChangeBuyerPassword() {
  return useMutationWithToast<MessageResponse, ChangeBuyerPasswordPayload>(
    changeBuyerPassword,
    { successMsg: "Password changed successfully." },
  );
}

// ─── Addresses: List ──────────────────────────────────────────────────────────
// Separate from useBuyerProfile() even though GET /buyer/profile already
// embeds addresses — useful when a component only needs the address book
// (e.g. checkout) without pulling the whole profile.
export function useBuyerAddresses() {
  const ready = useIsBuyerReady();

  return useQuery<BuyerAddress[], Error>({
    queryKey: BUYER_ADDRESSES_KEY,
    queryFn: getBuyerAddresses,
    enabled: ready,
    staleTime: 1_000 * 60 * 5,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

function invalidateAddressCaches(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: BUYER_ADDRESSES_KEY });
  queryClient.invalidateQueries({ queryKey: BUYER_PROFILE_KEY }); // embeds addresses too
}

// ─── Add Address ──────────────────────────────────────────────────────────────
export function useAddBuyerAddress() {
  const queryClient = useQueryClient();

  return useMutationWithToast<BuyerAddress, CreateAddressPayload>(addBuyerAddress, {
    successMsg: "Address added successfully.",
    onSuccess: () => invalidateAddressCaches(queryClient),
  });
}

// ─── Update Address ───────────────────────────────────────────────────────────
export function useUpdateBuyerAddress() {
  const queryClient = useQueryClient();

  return useMutationWithToast<BuyerAddress, { id: string; payload: UpdateAddressPayload }>(
    updateBuyerAddress,
    {
      successMsg: "Address updated successfully.",
      onSuccess: () => invalidateAddressCaches(queryClient),
    },
  );
}

// ─── Set Default Address (server returns the full refreshed list) ──────────
export function useSetDefaultBuyerAddress() {
  const queryClient = useQueryClient();

  return useMutationWithToast<BuyerAddress[], string>(setDefaultBuyerAddress, {
    successMsg: "Default address updated.",
    onSuccess: () => invalidateAddressCaches(queryClient),
  });
}

// ─── Delete Address (server returns the full refreshed list) ────────────────
export function useDeleteBuyerAddress() {
  const queryClient = useQueryClient();

  return useMutationWithToast<BuyerAddress[], string>(deleteBuyerAddress, {
    successMsg: "Address deleted successfully.",
    onSuccess: () => invalidateAddressCaches(queryClient),
  });
}