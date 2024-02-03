import { Transform, TransformFnParams } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength 	} from "class-validator";

const Trim = () => Transform(({value}: TransformFnParams) => {
	return value?.trim()
})

export class InputModelClassCreateBody {
	@IsString()
	@Trim()
	@IsNotEmpty()
	@MinLength(3)
	@MaxLength(10)
	login: string

	@IsString()
	@Trim()
	@IsNotEmpty()
	@MinLength(6)
	@MaxLength(20)
	@IsNotEmpty()
	password: string

	@IsEmail({}, {
		message: "incorrect email"
	})
	email: string
 }

export class UserClass {
  id: string;
  userName: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
}

  