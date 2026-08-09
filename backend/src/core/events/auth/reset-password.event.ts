export class PasswordResetRequestEvent {
  constructor(
    public readonly buyerId: string,
    public readonly email: string,
  ) {}
}