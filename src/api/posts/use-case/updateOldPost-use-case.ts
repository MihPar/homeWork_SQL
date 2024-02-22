import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { inputModelPostClass } from "../dto/posts.class.pipe";
import { PostsRepository } from "../posts.repository";
import { PostClass } from "../post.class";
import { LikeStatusEnum } from "../../likes/likes.emun";
import { PostsViewModel } from "../posts.type";

export class UpdateOldPostCommand {
	constructor(
		public postId: string,
    	public inputModelData: inputModelPostClass,
	) {}
}

@CommandHandler(UpdateOldPostCommand)
export class UpdateOldPostUseCase implements ICommandHandler<UpdateOldPostCommand> {
	constructor(
		protected readonly postsRepository: PostsRepository
	) {}
	async execute(command: UpdateOldPostCommand): Promise<PostsViewModel | null> {
		const findPostById: PostClass = await this.postsRepository.findPostById(command.postId)
		if(!findPostById) return null
		const findNewestLike = await this.postsRepository.findNewestLike(command.postId)
		if(!findNewestLike) return null
		const newPost = new PostClass(
			command.inputModelData.title,
			command.inputModelData.shortDescription,
			command.inputModelData.content,
			command.inputModelData.blogId,
			findPostById.blogName,
			findPostById.likesCount,
			findPostById.dislikesCount,
			)
			const updatPostById: PostClass = await this.postsRepository.updatePost(
				newPost, findNewestLike
			);
			return updatPostById ? PostClass.getPostsViewModel(updatPostById, findNewestLike) : null
	}
}