import { Transform, TransformFnParams } from "class-transformer";
import { applyDecorators } from "@nestjs/common";
import { IsEnum, IsMongoId, IsNotEmpty, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import { LikeStatusEnum } from "../../likes/likes.emun";

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
	@IsUUID()
	blogId: string
  }

  export class InputModelClassPostId {
	@IsUUID()
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