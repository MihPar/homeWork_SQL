import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { LikesRepository } from "../likes.repository";

export class DeleteAllLikesCommnad {
	constructor() {}
}

@CommandHandler(DeleteAllLikesCommnad)
export class DeleteAllLikesUseCase implements ICommandHandler<DeleteAllLikesCommnad> {
	constructor(
		protected readonly likesRepository: LikesRepository
	) {}
 	async execute(command: DeleteAllLikesCommnad): Promise<any> {
		return await this.likesRepository.deleteLikes()
	}
}