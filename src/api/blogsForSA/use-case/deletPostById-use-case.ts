import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { inputModelUpdataPost } from "../dto/blogs.class-pipe";
import { PostsRepository } from "../../posts/posts.repository";

export class DeletePostByIdCommand {
	constructor(
		public dto: inputModelUpdataPost
	) {}
}

@CommandHandler(DeletePostByIdCommand)
export class DeletePostByIdCommandUseCase implements ICommandHandler<DeletePostByIdCommand> {
	constructor(
		protected readonly postRepository: PostsRepository
	) {}
 	async execute(command: DeletePostByIdCommand): Promise<any> {
		return await this.postRepository.deletedPostByIdWithBlogId(command.dto.postId, command.dto.blogId);
	}
}