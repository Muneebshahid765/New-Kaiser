import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutationWithToast } from "@/hooks/use-mutation-toast";
import {
  getBuyerAddresses,
  createBuyerAddress,
  updateBuyerAddress,
  setDefaultBuyerAddress,
  deleteBuyerAddress,
} from "../api/buyer-address.api";
import { BuyerAddressesResponse, SingleBuyerAddressResponse } from "../types/buyer-address-response.types";
import { CreateBuyerAddressPayload, UpdateBuyerAddressPayload } from "../schemas/buyer-address.schema";


export const BUYER_ADDRESSES_KEY = ["buyer", "addresses"] as const;

export function useBuyerAddresses() {
  return useQuery<BuyerAddressesResponse, Error>({
    queryKey: BUYER_ADDRESSES_KEY,
    queryFn: getBuyerAddresses,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnWindowFocus: false,
  });
}

export function useCreateBuyerAddress() {
  const queryClient = useQueryClient();
  return useMutationWithToast<SingleBuyerAddressResponse, CreateBuyerAddressPayload>(
    createBuyerAddress,
    {
      successMsg: "Address successfully add ho gaya.",
      onSuccess: () => queryClient.invalidateQueries({ queryKey: BUYER_ADDRESSES_KEY }),
    }
  );
}

export function useUpdateBuyerAddress() {
  const queryClient = useQueryClient();
  return useMutationWithToast<
    SingleBuyerAddressResponse,
    { id: string; dto: UpdateBuyerAddressPayload }
  >(updateBuyerAddress, {
    successMsg: "Address update ho gaya.",
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BUYER_ADDRESSES_KEY }),
  });
}

export function useSetDefaultBuyerAddress() {
  const queryClient = useQueryClient();
  return useMutationWithToast<SingleBuyerAddressResponse, string>(
    setDefaultBuyerAddress,
    {
      successMsg: "Default address update ho gaya.",
      onSuccess: () => queryClient.invalidateQueries({ queryKey: BUYER_ADDRESSES_KEY }),
    }
  );
}

export function useDeleteBuyerAddress() {
  const queryClient = useQueryClient();
  return useMutationWithToast<{ success: boolean; message: string }, string>(
    deleteBuyerAddress,
    {
      successMsg: "Address delete ho gaya.",
      onSuccess: () => queryClient.invalidateQueries({ queryKey: BUYER_ADDRESSES_KEY }),
    }
  );
}