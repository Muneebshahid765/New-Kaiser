import { get, post, patch, del } from "@/services/https";
import type {
  CreateBuyerAddressPayload,
  UpdateBuyerAddressPayload,
} from "../schemas/buyer-address.schema";
import { BuyerAddressesResponse, SingleBuyerAddressResponse } from "../types/buyer-address-response.types";

export const getBuyerAddresses = () =>
  get<BuyerAddressesResponse>("/buyer/addresses");

export const getBuyerAddressById = (id: string) =>
  get<SingleBuyerAddressResponse>(`/buyer/addresses/${id}`);

export const createBuyerAddress = (dto: CreateBuyerAddressPayload) =>
  post<SingleBuyerAddressResponse>("/buyer/addresses", dto);

export const updateBuyerAddress = ({
  id,
  dto,
}: {
  id: string;
  dto: UpdateBuyerAddressPayload;
}) => patch<SingleBuyerAddressResponse>(`/buyer/addresses/${id}`, dto);

export const setDefaultBuyerAddress = (id: string) =>
  patch<SingleBuyerAddressResponse>(`/buyer/addresses/${id}/set-default`, {});

export const deleteBuyerAddress = (id: string) =>
  del<{ success: boolean; message: string }>(`/buyer/addresses/${id}`);