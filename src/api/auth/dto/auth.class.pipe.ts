import { applyDecorators } from "@nestjs/common"
import { Transform, TransformFnParams } from "class-transformer"
import { IsEmail, IsNotEmpty, IsString, IsUUID, Length, Matches, MaxLength, MinLength } from "class-validator"

const UUID_VERSION = '4' 

const UUID = () => IsUUID(UUID_VERSION)

export class InputDataModelClassAuth {
	@IsString()
	loginOrEmail: string
	@IsString()
  	password: string
}

const Trim = () => Transform(({value}: TransformFnParams) => value?.trim())

function RequiredString() {
	return applyDecorators(IsString(), Trim(), IsNotEmpty())
}

export class emailInputDataClass {
	@RequiredString()
	@IsEmail()
	email: string
}

export class InputModelNewPasswordClass {
	@IsString()
	@Trim() 
	@MinLength(6)
	@MaxLength(20)
	newPassword: string

	@IsString()
	@Trim() 
	@IsNotEmpty()
	recoveryCode: string
}

export class InputDateReqConfirmClass {
	@IsString()
	@Trim()
	@UUID()
	code: string
}

export class InputDataReqClass {
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
	password: string

	@IsEmail()
	@IsString()
	@Trim() 
	@IsNotEmpty()
	email: string
}