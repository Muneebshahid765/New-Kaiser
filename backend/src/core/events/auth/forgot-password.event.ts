export class ForgotPasswordResetRequestedEvent {
  constructor(
    public readonly buyerId: string,
    public readonly firstName: string,
    public readonly email: string,
    public readonly resetToken: string,
  ) {}
}