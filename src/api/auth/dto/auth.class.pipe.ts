import { applyDecorators } from "@nestjs/common"
import { ApiProperty } from "@nestjs/swagger"
import { Transform, TransformFnParams } from "class-transformer"
import { IsEmail, IsNotEmpty, IsString, IsUUID, MaxLength, MinLength, Validate } from "class-validator"
import { CustomLoginvalidation } from "../adapter/customLoginValidator"
import { CustomEmailvalidation } from "../adapter/customEmailValidatro"

// const UUID_VERSION = '4' 
// const UUID = () => IsUUID(UUID_VERSION)

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
	@IsUUID()
	code: string
}

export class InputDataReqClass {
	@IsString()
	@Trim() 
	@IsNotEmpty()
	@MinLength(3)
	@MaxLength(10)
	@ApiProperty()
	@IsEmail()
	@Validate(CustomLoginvalidation)
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
	@ApiProperty()
	@IsEmail()
	@Validate(CustomEmailvalidation)
	email: string
}