export enum MailJobType {
  VERIFICATION = 'VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  ORDER_CONFIRMATION = 'ORDER_CONFIRMATION',
}

export interface MailJobPayload {
  to: string;
  type: MailJobType;
  context: Record<string, any>;
}