import { Transform, TransformFnParams } from "class-transformer";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { UserViewType } from "./user.type";

const Trim = () =>
  Transform(({ value }: TransformFnParams) => {
    return value?.trim();
  });

export class InputModelClassCreateBody {
  @IsString()
  @Trim()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(10)
  login: string;

  @IsString()
  @Trim()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  @IsNotEmpty()
  password: string;

  @IsEmail()
  @IsString()
  @Trim()
  @IsNotEmpty()
  email: string;
}

export class UserClass {
  id: string;
  userName: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  confirmationCode: string;
  expirationDate: string;
  isConfirmed: boolean;

  getViewUser(): UserViewType {
    return {
      id: this.id.toString(),
      login: this.userName,
      email: this.email,
      createdAt: this.createdAt,
    };
  }
}

