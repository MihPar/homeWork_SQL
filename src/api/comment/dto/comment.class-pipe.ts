import { Transform, TransformFnParams } from "class-transformer";
import { IsEnum, IsIn, IsMongoId, IsNotEmpty, IsString, IsUUID, Length, Matches, MaxLength, MinLength } from "class-validator";
import { applyDecorators } from "@nestjs/common";
import { LikeStatusEnum } from "../../likes/likes.emun";

const Trim = () => Transform(({value}: TransformFnParams) => value?.trim())

const allowedValues = ['Like', 'Dislike', 'None']

  export class InputModelLikeStatusClass {
	@IsString()
	@IsNotEmpty()
	@Matches(new RegExp(`^(${allowedValues.join('|')})$`))
	likeStatus: string
  }

export class updateLikeDto{
    @IsIn(Object.values(LikeStatusEnum))
    likeStatus: LikeStatusEnum

}

  export class inputModelCommentId {
	@IsUUID()
	commentId: string
  }

  export class InputModelContent {
	@IsString() 
	@Trim()
	@IsNotEmpty()
	@MinLength(20)
	@MaxLength(300)
	content: string
  }

  export class inputModelId {
	@IsUUID()
	id: string
  }