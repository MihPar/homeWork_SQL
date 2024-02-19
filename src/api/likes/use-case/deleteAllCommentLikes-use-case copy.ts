import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { LikesRepository } from "../likes.repository";

export class DeleteAllCommentLikesCommand {
	constructor() {}
}

@CommandHandler(DeleteAllCommentLikesCommand)
export class DeleteAllCommentLikesUseCase implements ICommandHandler<DeleteAllCommentLikesCommand> {
	constructor(
		protected readonly likesRepository: LikesRepository
	) {}
 	async execute(command: DeleteAllCommentLikesCommand): Promise<any> {
		return await this.likesRepository.deleteCommentLikes()
	}
}