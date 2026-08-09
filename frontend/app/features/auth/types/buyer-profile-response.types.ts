// features/buyer-profile/types/buyer-profile-response.types.ts

export interface MessageResponse {
  message: string;
}

export interface BuyerAddress {
  id: string;
  buyerProfileId: string;
  label: string;
  fullName: string | null;
  phone: string | null;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── GET /buyer/profile ───────────────────────────────────────────────────────
export interface BuyerProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  stripeCustomerId: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    lastLogin: string | null;
  };
  addresses: BuyerAddress[];
}

// ─── PUT /buyer/profile ───────────────────────────────────────────────────────
export interface UpdateBuyerProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  updatedAt: string;
}