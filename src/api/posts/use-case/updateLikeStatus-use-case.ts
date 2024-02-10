import { InputModelLikeStatusClass } from './../../comment/comment.class-pipe';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UserClass } from "../../../schema/user.schema";
import { LikesRepository } from "../../likes/likes.repository";
import { PostsRepository } from "../posts.repository";

export class UpdateLikeStatusCommand {
	constructor(
		public status: InputModelLikeStatusClass,
		public postId: string, 
		public userId: string | null,
		public user: UserClass,
	) {}
}

@CommandHandler(UpdateLikeStatusCommand)
export class UpdateLikeStatusUseCase implements ICommandHandler<UpdateLikeStatusCommand> {
	constructor(
		protected readonly likesRepository: LikesRepository,
		protected readonly postsRepository: PostsRepository
	) {}
	async execute(command: UpdateLikeStatusCommand): Promise<boolean | void | null> {
		const userLogin = command.user.accountData.userName;
		if(!command.userId) return null
		const userId = command.userId
		const findLike = await this.likesRepository.findLikePostByUser(command.postId, userId)
	if(!findLike) {
		await this.likesRepository.saveLikeForPost(command.postId, userId, command.status.likeStatus, userLogin)
		const resultCheckListOrDislike = await this.postsRepository.increase(command.postId, command.status.likeStatus)
		return true
	} 
	
	if((findLike.myStatus === 'Dislike' || findLike.myStatus === 'Like') && command.status.likeStatus === 'None'){
		await this.likesRepository.updateLikeStatusForPost(command.postId, userId, command.status.likeStatus)
		const resultCheckListOrDislike = await this.postsRepository.decrease(command.postId, findLike.myStatus)
		return true
	}

	if(findLike.myStatus === 'None' && (command.status.likeStatus === 'Dislike' || command.status.likeStatus === 'Like')) {
		await this.likesRepository.updateLikeStatusForPost(command.postId, userId, command.status.likeStatus)
		const resultCheckListOrDislike = await this.postsRepository.increase(command.postId, command.status.likeStatus)
		return true
	}

	if(findLike.myStatus === 'Dislike' && command.status.likeStatus === 'Like') {
		await this.likesRepository.updateLikeStatusForPost(command.postId, userId, command.status.likeStatus)
		const changeDislikeOnLike = await this.postsRepository.increase(command.postId, command.status.likeStatus)
		const changeLikeOnDislike = await this.postsRepository.decrease(command.postId, findLike.myStatus)
		return true
	}
	if(findLike.myStatus === 'Like' && command.status.likeStatus === 'Dislike') {
		await this.likesRepository.updateLikeStatusForPost(command.postId, userId, command.status.likeStatus)
		const changeLikeOnDislike = await this.postsRepository.decrease(command.postId, findLike.myStatus)
		const changeDislikeOnLike = await this.postsRepository.increase(command.postId, command.status.likeStatus)
		return true
	}
	return true
	}
}


	