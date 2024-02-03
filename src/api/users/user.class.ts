import { UserViewType } from "./user.type";

export class AccountDataClass {
  userName: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export class EmailConfirmationClass {
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
}

export class UserClass {
  constructor(
    userName: string,
    email: string,
    passwordHash: string,
    confirmationCode: string,
    expirationDate: Date,
    isConfirmed: boolean
  ) {
    this.accountData = {
      userName,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    this.emailConfirmation = {confirmationCode, expirationDate, isConfirmed };
  }
  accountData: AccountDataClass;
  emailConfirmation: EmailConfirmationClass;
  getViewUser(): UserViewType {
    return {
      login: this.accountData.userName,
      email: this.accountData.email,
      createdAt: this.accountData.createdAt,
    };
  }
}
