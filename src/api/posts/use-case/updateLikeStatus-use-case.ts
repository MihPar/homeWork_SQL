import { InputModelLikeStatusClass } from '../../comment/dto/comment.class-pipe';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { LikesRepository } from "../../likes/likes.repository";
import { PostsRepository } from "../posts.repository";
import { UserClass } from '../../users/user.class';

export class UpdateLikeStatusCommand {
	constructor(
		public status: InputModelLikeStatusClass,
		public postId: string, 
		public userId: string | null,
		public user: UserClass
	) {}
}

@CommandHandler(UpdateLikeStatusCommand)
export class UpdateLikeStatusForPostUseCase implements ICommandHandler<UpdateLikeStatusCommand> {
	constructor(
		protected readonly likesRepository: LikesRepository,
		protected readonly postsRepository: PostsRepository
	) {}
	async execute(command: UpdateLikeStatusCommand): Promise<boolean | void | null> {
		const userLogin = command.user.userName
		if(!command.userId) return null
		const userId = command.userId
		// console.log('Try')
		const findLike = await this.likesRepository.findLikeByPostId(command.postId, command.userId!)
		// console.log("findLike: ", findLike)
	if(!findLike) {
		await this.likesRepository.saveLikeForPost(command.postId, userId, command.status.likeStatus, userLogin)
		const resultCheckListOrDislike = await this.postsRepository.increase(command.postId, command.status.likeStatus, userId)
		return true
	} 
	
	if((findLike.myStatus === 'Dislike' || findLike.myStatus === 'Like') && command.status.likeStatus === 'None'){
		// console.log("try")
		await this.likesRepository.updateLikeStatusForPost(command.postId, command.status.likeStatus)
		const resultCheckListOrDislike = await this.postsRepository.decrease(command.postId, findLike.myStatus, userId)
		return true
	}

	if(findLike.myStatus === 'None' && (command.status.likeStatus === 'Dislike' || command.status.likeStatus === 'Like')) {
		// console.log("try")
		await this.likesRepository.updateLikeStatusForPost(command.postId, command.status.likeStatus)
		const resultCheckListOrDislike = await this.postsRepository.increase(command.postId, command.status.likeStatus, userId)
		return true
	}

	if(findLike.myStatus === 'Dislike' && command.status.likeStatus === 'Like') {
		await this.likesRepository.updateLikeStatusForPost(command.postId, command.status.likeStatus)
		const changeDislikeOnLike = await this.postsRepository.increase(command.postId, command.status.likeStatus, userId)
		const changeLikeOnDislike = await this.postsRepository.decrease(command.postId, findLike.myStatus, userId)
		return true
	}
	if(findLike.myStatus === 'Like' && command.status.likeStatus === 'Dislike') {
		await this.likesRepository.updateLikeStatusForPost(command.postId, command.status.likeStatus)
		const changeLikeOnDislike = await this.postsRepository.decrease(command.postId, findLike.myStatus, userId)
		const changeDislikeOnLike = await this.postsRepository.increase(command.postId, command.status.likeStatus, userId)
		return true
	}
	return true
	}
}