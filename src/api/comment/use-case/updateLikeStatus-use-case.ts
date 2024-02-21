import { InputModelLikeStatusClass, inputModelCommentId } from "../dto/comment.class-pipe";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentRepository } from "../comment.repository";
import { LikesRepository } from "../../likes/likes.repository";
import { CommentClass } from "../comment.class";
import { CommentQueryRepository } from "../comment.queryRepository";
import { NotFoundException } from "@nestjs/common";

export class UpdateLikestatusCommand {
	constructor(
		public status: InputModelLikeStatusClass,
		public id: inputModelCommentId,
		public userId: string
	) {}
}

@CommandHandler(UpdateLikestatusCommand)
export class UpdateLikestatusForCommentUseCase implements ICommandHandler<UpdateLikestatusCommand> {
	constructor(
		protected readonly likesRepository: LikesRepository,
		protected readonly commentRepositoriy: CommentRepository,
		protected readonly commentQueryRepository: CommentQueryRepository

	) {}
	async execute(command: UpdateLikestatusCommand): Promise<boolean> {
		const findCommentById: CommentClass | null =
      await this.commentQueryRepository.findCommentByCommentId(command.id.commentId, command.userId);
    if (!findCommentById) throw new NotFoundException('404');
		const findLike = await this.likesRepository.findLikeByCommentIdBy(command.id.commentId, command.userId)
	if(!findLike) {
		await this.likesRepository.saveLikeForComment(command.id.commentId, command.userId, command.status.likeStatus)
		const resultCheckLikeOrDislike = await this.commentRepositoriy.increase(command.id.commentId, command.status.likeStatus, command.userId)
		return true
	} 
	
	if((findLike.myStatus === 'Dislike' || findLike.myStatus === 'Like') && command.status.likeStatus === 'None'){
		await this.likesRepository.updateLikeStatusForComment(command.id.commentId, command.userId, command.status.likeStatus)
		const resultCheckListOrDislike = await this.commentRepositoriy.decrease(command.id.commentId, findLike.myStatus,  command.userId)
		return true
	}

	if(findLike.myStatus === 'None' && (command.status.likeStatus === 'Dislike' || command.status.likeStatus === 'Like')) {
		await this.likesRepository.updateLikeStatusForComment(command.id.commentId, command.userId, command.status.likeStatus)
		const resultCheckListOrDislike = await this.commentRepositoriy.increase(command.id.commentId, command.status.likeStatus, command.userId)
		return true
	}

	if(findLike.myStatus === 'Dislike' && command.status.likeStatus === 'Like') {
		await this.likesRepository.updateLikeStatusForComment(command.id.commentId, command.userId, command.status.likeStatus)
		const changeDislikeOnLike = await this.commentRepositoriy.increase(command.id.commentId, command.status.likeStatus, command.userId)
		const changeLikeOnDislike = await this.commentRepositoriy.decrease(command.id.commentId, findLike.myStatus,  command.userId)
		return true
	}
	if(findLike.myStatus === 'Like' && command.status.likeStatus === 'Dislike') {
		await this.likesRepository.updateLikeStatusForComment(command.id.commentId, command.userId, command.status.likeStatus)
		const changeLikeOnDislike = await this.commentRepositoriy.decrease(command.id.commentId, findLike.myStatus,  command.userId)
		const changeDislikeOnLike = await this.commentRepositoriy.increase(command.id.commentId, command.status.likeStatus, command.userId)
		return true
	}
	return true
	}
}
