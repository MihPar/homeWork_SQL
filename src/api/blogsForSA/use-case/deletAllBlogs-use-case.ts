import { BlogsRepositoryForSA } from '../blogsForSA.repository';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

export class DeleteAllBlogsForSACommnad {
	constructor() {}
}

@CommandHandler(DeleteAllBlogsForSACommnad)
export class DeleteAllBlogsForSAUseCase implements ICommandHandler<DeleteAllBlogsForSACommnad> {
	constructor(
		protected readonly blogsRepositoryForSA: BlogsRepositoryForSA
	) {}
 	async execute(command: DeleteAllBlogsForSACommnad): Promise<any> {
		return await this.blogsRepositoryForSA.deleteRepoBlogsFroSA();
	}
}