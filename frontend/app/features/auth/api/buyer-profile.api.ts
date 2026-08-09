// features/buyer-profile/api/buyer-profile.api.ts
import { get, put, post, patch, del } from "@/services/https";
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

// ─── Profile ──────────────────────────────────────────────────────────────────
export const getBuyerProfile = () => get<BuyerProfileResponse>("/buyer/profile");

export const updateBuyerProfile = (payload: UpdateBuyerProfilePayload) =>
  put<UpdateBuyerProfileResponse>("/buyer/profile", payload);

export const changeBuyerPassword = (payload: ChangeBuyerPasswordPayload) =>
  put<MessageResponse>("/buyer/profile/change-password", payload);

// ─── Addresses ────────────────────────────────────────────────────────────────
export const getBuyerAddresses = () => get<BuyerAddress[]>("/buyer/profile/addresses");

export const addBuyerAddress = (payload: CreateAddressPayload) =>
  post<BuyerAddress>("/buyer/profile/addresses", payload);

export const updateBuyerAddress = ({
  id,
  payload,
}: {
  id: string;
  payload: UpdateAddressPayload;
}) => put<BuyerAddress>(`/buyer/profile/addresses/${id}`, payload);

// Both of these intentionally return the FULL updated address list (that's
// what the backend sends back — see BuyerProfileService.setDefaultAddress /
// deleteAddress, both of which `return this.getAddresses(userId)`), not just
// the single affected address.
export const setDefaultBuyerAddress = (id: string) =>
  patch<BuyerAddress[]>(`/buyer/profile/addresses/${id}/default`);

export const deleteBuyerAddress = (id: string) =>
  del<BuyerAddress[]>(`/buyer/profile/addresses/${id}`);