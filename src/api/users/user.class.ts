import { Transform, TransformFnParams } from "class-transformer";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsUUID,
  MinLength,
} from "class-validator";
import { UserViewType } from "./user.type";

const UUID_VERSION = '4' 
const UUID = () => IsUUID(UUID_VERSION)

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

export class dtoType {
	@IsString()
	@Trim()
	@IsUUID()
	id: string
}

export class UserClass {
	constructor(
		public userName: string,
		public email: string,
		public passwordHash: string,
		public createdAt: string,
		public confirmationCode: string,
		public expirationDate: string,
		public isConfirmed: boolean = false
	){}
	id: string
 

  getViewUser(): UserViewType {
    return {
      id: this.id.toString(),
      login: this.userName,
      email: this.email,
      createdAt: this.createdAt,
    };
  }
}

