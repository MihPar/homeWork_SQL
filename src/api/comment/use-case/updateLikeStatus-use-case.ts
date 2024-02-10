import { InputModelLikeStatusClass, inputModelCommentId } from "../dto/comment.class-pipe";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentRepository } from "../comment.repository";
import { LikesRepository } from "../../likes/likes.repository";

export class UpdateLikestatusCommand {
	constructor(
		public status: InputModelLikeStatusClass,
		public id: inputModelCommentId,
		public userId: string
	) {}
}

@CommandHandler(UpdateLikestatusCommand)
export class UpdateLikestatusUseCase implements ICommandHandler<UpdateLikestatusCommand> {
	constructor(
		protected readonly likesRepository: LikesRepository,
		protected readonly commentRepositoriy: CommentRepository

	) {}
	async execute(command: UpdateLikestatusCommand): Promise<boolean> {
		const findLike = await this.likesRepository.findLikeCommentByUser(command.id.commentId, command.userId)
	if(!findLike) {
		await this.likesRepository.saveLikeForComment(command.id.commentId, command.userId, command.status.likeStatus)
		const resultCheckListOrDislike = await this.commentRepositoriy.increase(command.id.commentId, command.status.likeStatus)
		return true
	} 
	
	if((findLike.myStatus === 'Dislike' || findLike.myStatus === 'Like') && command.status.likeStatus === 'None'){
		await this.likesRepository.updateLikeStatusForComment(command.id.commentId, command.userId, command.status.likeStatus)
		const resultCheckListOrDislike = await this.commentRepositoriy.decrease(command.id.commentId, findLike.myStatus)
		return true
	}

	if(findLike.myStatus === 'None' && (command.status.likeStatus === 'Dislike' || command.status.likeStatus === 'Like')) {
		await this.likesRepository.updateLikeStatusForComment(command.id.commentId, command.userId, command.status.likeStatus)
		const resultCheckListOrDislike = await this.commentRepositoriy.increase(command.id.commentId, command.status.likeStatus)
		return true
	}

	if(findLike.myStatus === 'Dislike' && command.status.likeStatus === 'Like') {
		await this.likesRepository.updateLikeStatusForComment(command.id.commentId, command.userId, command.status.likeStatus)
		const changeDislikeOnLike = await this.commentRepositoriy.increase(command.id.commentId, command.status.likeStatus)
		const changeLikeOnDislike = await this.commentRepositoriy.decrease(command.id.commentId, findLike.myStatus)
		return true
	}
	if(findLike.myStatus === 'Like' && command.status.likeStatus === 'Dislike') {
		await this.likesRepository.updateLikeStatusForComment(command.id.commentId, command.userId, command.status.likeStatus)
		const changeLikeOnDislike = await this.commentRepositoriy.decrease(command.id.commentId, findLike.myStatus)
		const changeDislikeOnLike = await this.commentRepositoriy.increase(command.id.commentId, command.status.likeStatus)
		return true
	}
	return true
	}
}
