import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PostsRepository } from "../posts.repository";
import { ObjectId } from "mongodb";

export class DeletePostByIdCommand {
	constructor(
		public postId: string
	) {}
}

@CommandHandler(DeletePostByIdCommand)
export class DeletePostByIdUseCase implements ICommandHandler<DeletePostByIdCommand> {
	constructor(
		protected readonly postsRepository: PostsRepository
	) {}
	async execute(command: DeletePostByIdCommand): Promise<boolean> {
		if(!ObjectId.isValid(command.postId)) return false;
		return await this.postsRepository.deletedPostById(command.postId);
	}
}