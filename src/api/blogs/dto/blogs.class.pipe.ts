import { IsNotEmpty, IsString, IsUUID, IsUrl, MaxLength } from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";
import { applyDecorators } from "@nestjs/common";

const Trim = () => Transform(({value}: TransformFnParams) => value?.trim())

function IsCustomString() {
	return applyDecorators(IsString(), Trim(), IsNotEmpty())
}

  export class bodyBlogsModel {
	@IsString() 
	@Trim() 
	@IsNotEmpty()
	@MaxLength(15)
	name: string

	@IsString() 
	@Trim() 
	@IsNotEmpty()
	@MaxLength(500)
    description: string
	
	@IsUrl()
	@MaxLength(100)
    websiteUrl: string
}

export class inputModelClass {
	@IsUUID()
	blogId: string
}