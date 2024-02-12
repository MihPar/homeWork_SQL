import { BlogsRepositoryForSA } from './../blogs.repository';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

export class DeleteAllBlogsCommnad {
	constructor() {}
}

@CommandHandler(DeleteAllBlogsCommnad)
export class DeleteAllBlogsUseCase implements ICommandHandler<DeleteAllBlogsCommnad> {
	constructor(
		protected readonly blogsRepositoryForSA: BlogsRepositoryForSA
	) {}
 	async execute(command: DeleteAllBlogsCommnad): Promise<any> {
		return await this.blogsRepositoryForSA.deleteRepoBlogsFroSA();
	}
}