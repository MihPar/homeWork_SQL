import { BlogsRepository } from './../blogs.repository';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

export class DeleteAllBlogsCommnad {
	constructor() {}
}

@CommandHandler(DeleteAllBlogsCommnad)
export class DeleteAllBlogsUseCase implements ICommandHandler<DeleteAllBlogsCommnad> {
	constructor(
		protected readonly blogsRepository: BlogsRepository
	) {}
 	async execute(command: DeleteAllBlogsCommnad): Promise<any> {
		return await this.blogsRepository.deleteRepoBlogs();
	}
}