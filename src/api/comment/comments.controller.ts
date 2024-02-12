// import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, HttpCode, NotFoundException, Param, Put, UseGuards, ValidationPipe } from '@nestjs/common';
// import { CommentQueryRepository } from './comment.queryRepository';
// import { CommentViewModel } from './comment.type';
// import { InputModelContent, InputModelLikeStatusClass, inputModelCommentId, inputModelId } from './dto/comment.class-pipe';
// import { CommentService } from './comment.service';
// import { CommentRepository } from './comment.repository';
// import { UpdateLikestatusCommand } from './use-case/updateLikeStatus-use-case';
// import { CommandBus } from '@nestjs/cqrs';
// import { UpdateCommentByCommentIdCommand } from './use-case/updateCommentByCommentId-use-case';
// import { SkipThrottle } from '@nestjs/throttler';
// import { UserDecorator, UserIdDecorator } from '../../infrastructura/decorators/decorator.user';
// import { UserClass } from '../users/user.class';
// import { CommentClass } from './comment.class';

// @SkipThrottle()
// @Controller('comments')
// export class CommentsController {
//   constructor(
//     protected commentQueryRepository: CommentQueryRepository,
//     protected commentService: CommentService,
// 	protected commentRepository: CommentRepository,
// 	protected commandBus: CommandBus
//   ) {}

//   @HttpCode(204)
//   @Put(':commentId/like-status')
// //   @UseGuards(authMiddleware)
//   async updateByCommentIdLikeStatus(
//     @Body(new ValidationPipe({ validateCustomDecorators: true })) status: InputModelLikeStatusClass,
//     @Param() id: inputModelCommentId,
//     @UserDecorator() user: UserClass,
//     @UserIdDecorator() userId: string,
//   ) {
//     const findCommentById: CommentClass | null =
//       await this.commentQueryRepository.findCommentByCommentId(id.commentId);
//     if (!findCommentById) throw new NotFoundException('404');
//     const findLike = await this.commentQueryRepository.findLikeCommentByUser(
//       id.commentId,
//       userId,
//     );
//     const commentDBBiew = commentDBToView(
//       findCommentById,
//       findLike?.myStatus ?? null,
//     );

// 	const command = new UpdateLikestatusCommand(status, id, userId)
// 	await this.commandBus.execute(command)
// 	return 
//   }

//   @Put(':commentId')
//   @HttpCode(204)
//   @UseGuards(CheckRefreshTokenForComments)
//   async updataCommetById(
// 	@Param() id: inputModelCommentId, 
// 	@Body(new ValidationPipe({ validateCustomDecorators: true })) dto: InputModelContent,
// 	@UserDecorator() user: UserClass,
// 	@UserIdDecorator() userId: string,
// 	) {
//     const isExistComment = await this.commentQueryRepository.findCommentById(id.commentId, userId);
//     if (!isExistComment) throw new NotFoundException('404');
//     if (userId.toString() !== isExistComment.commentatorInfo.userId) { throw new ForbiddenException("403")}
// 	const command = new UpdateCommentByCommentIdCommand(id.commentId, dto)
// 	const updateComment: boolean = await this.commandBus.execute(command)
//     if (!updateComment) throw new NotFoundException('404');
// 	return
//   }

//   @Delete(':commentId')
//   @HttpCode(204)
//   @UseGuards(CheckRefreshTokenForComments)
//   async deleteCommentById(
// 	@Param() dto: inputModelCommentId,
// 	@UserDecorator() user: UserClass,
// 	@UserIdDecorator() userId: string // | null
// 	) {
//     	const isExistComment = await this.commentQueryRepository.findCommentById(dto.commentId, userId);
//     if (!isExistComment) throw new NotFoundException("404")
//     if (userId.toString() !== isExistComment.commentatorInfo.userId) { throw new ForbiddenException("403")}
//     const deleteCommentById: boolean =
//       await this.commentRepository.deleteComment(dto.commentId);
//     if (!deleteCommentById) throw new NotFoundException('404');
// 	return 
//   }

//   @Get(':id')
//   @HttpCode(200)
//   @UseGuards(CheckRefreshTokenForGet)
//   async getCommentById(
//     @Param() dto: inputModelId,
//     @UserDecorator() user: UserClass,
//     @UserIdDecorator() userId: string | null,
//   ) {
//     const getCommentById: CommentViewModel | null =
//       await this.commentQueryRepository.findCommentById(dto.id, userId);
// 	  console.log("getCommentById: ", getCommentById)
//     if (!getCommentById) throw new NotFoundException('Blogs by id not found');
//     return getCommentById;
//   }
// }
