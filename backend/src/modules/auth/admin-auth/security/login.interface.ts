type LoginSuccess = {
  message: string;
  token: string;
  data: any;
};

type TwoFactorRequired = {
  requiresTwoFactor: true;
  message: string;
  data: {
    email: string;
    tempSessionId: string;
  };
};

export type AdminLoginResponse = LoginSuccess | TwoFactorRequired;