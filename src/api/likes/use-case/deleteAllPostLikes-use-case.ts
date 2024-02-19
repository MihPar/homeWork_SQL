import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { LikesRepository } from "../likes.repository";

export class DeleteAllPostLikesCommand {
	constructor() {}
}

@CommandHandler(DeleteAllPostLikesCommand)
export class DeleteAllPostLikesUseCase implements ICommandHandler<DeleteAllPostLikesCommand> {
	constructor(
		protected readonly likesRepository: LikesRepository
	) {}
 	async execute(command: DeleteAllPostLikesCommand): Promise<any> {
		return await this.likesRepository.deletePostLikes()
	}
}