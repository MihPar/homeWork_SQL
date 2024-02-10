import { Transform, TransformFnParams } from "class-transformer";
import { applyDecorators } from "@nestjs/common";
import { IsEnum, IsMongoId, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

const Trim = () => Transform(({value}: TransformFnParams) => {
	return value?.trim()
})

export const IsCustomString = () => applyDecorators(IsString(), Trim(), IsNotEmpty())


  export class bodyPostsModelClass {
	// @IsCustomString()
	@IsString()
	@Trim() 
	@IsNotEmpty()
	@MaxLength(30)
	title: string

	// @IsCustomString()
	@IsString()
	@Trim() 
	@IsNotEmpty()
	@MaxLength(100)
	shortDescription: string

	// @IsCustomString()
	@IsString()
	@Trim() 
	@IsNotEmpty()
	@MaxLength(1000)
	content: string
}

export class inputModelPostClass {
	// @IsCustomString()
	@IsString()
	@Trim() 
	@IsNotEmpty()
	@MaxLength(30)
	title: string

	// @IsCustomString()
	@IsString()
	@Trim() 
	@IsNotEmpty()
	@MaxLength(100)
	shortDescription: string

	// @IsCustomString()
	@IsString()
	@Trim() 
	@IsNotEmpty()
	@MaxLength(1000)
	content: string
	
	@IsCustomString()
	blogId: string
  }

  export class InputModelClassPostId {
	@IsMongoId()
	postId: string
  }

  export class InputModelContentePostClass {
	@IsString()
	@Trim() 
	@IsNotEmpty()
	@MaxLength(300)
    @MinLength(20)
	content: string
  }

  export class likesDto {
    @IsEnum(LikeStatusEnum)
    likeStatus: LikeStatusEnum
}