import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PostsRepository } from "../posts.repository";

export class DeleteAllPostsComand {
	constructor() {}
}

@CommandHandler(DeleteAllPostsComand)
export class DeleteAllPostsUseCase implements ICommandHandler<DeleteAllPostsComand> {
	constructor(
		protected readonly postsRepository: PostsRepository
	) {}
 	async execute(command: DeleteAllPostsComand): Promise<any> {
			return await this.postsRepository.deleteRepoPosts();
	}
}