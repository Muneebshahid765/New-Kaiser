export interface BuyerAddress {
  id: string;
  buyerProfileId: string;
  label: string;
  fullName?: string | null;
  phone?: string | null;
  address1: string;
  address2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BuyerAddressesResponse {
  success: boolean;
  data: BuyerAddress[];
}

export interface SingleBuyerAddressResponse {
  success: boolean;
  data: BuyerAddress;
  message?: string;
}