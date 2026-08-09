/*eslint-disable*/
/**
 * Yeh event sirf DATA carry karta hai — "user register hua" ka fact.
 * Isay kaun sunta hai (mail listener, analytics listener, admin-notify
 * listener) is class ka concern nahi. Isi wajah se yeh apni alag file
 * mein hai, kisi specific listener ke andar nahi.
 */
export class UserRegisteredEvent {
  constructor(
    public readonly email: string,
    public readonly firstName: string,
    public readonly verificationCode: string,
  ) {}
}