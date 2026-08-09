export interface OtpVerifyPayload {
  challengeToken: string;
  otp:            number;
}

export interface EnableTwoFaRequestPayload {
  code: string;        
}


export interface TwofaVerifyPayload {
  challengeToken: string;
  code:           string;
}

