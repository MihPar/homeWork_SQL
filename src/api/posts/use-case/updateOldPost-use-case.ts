import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { inputModelPostClass } from "../dto/posts.class.pipe";
import { PostsRepository } from "../posts.repository";
import { ObjectId } from "mongodb";

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
	async execute(command: UpdateOldPostCommand): Promise<boolean> {
		if(!ObjectId.isValid(command.postId)) return false;
			const updatPostById: boolean = await this.postsRepository.updatePost(
				command.postId,
				command.inputModelData.title,
				command.inputModelData.shortDescription,
				command.inputModelData.content,
				command.inputModelData.blogId
			);
			return updatPostById;
	}
}