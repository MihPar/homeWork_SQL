import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsQueryRepositoryForSA } from '../blogsForSA.queryReposity';

export class DeleteBlogByIdForSACommnad {
  constructor(public id: string) {}
}
@CommandHandler(DeleteBlogByIdForSACommnad)
export class DeleteBlogByIdForSAUseCase implements ICommandHandler<DeleteBlogByIdForSACommnad> {
  constructor(protected readonly blogsQueryRepositoryForSA: BlogsQueryRepositoryForSA) {}
  async execute(command: DeleteBlogByIdForSACommnad): Promise<boolean | null> {
    const deleteId: boolean | null = await this.blogsQueryRepositoryForSA.deletedBlog(
      command.id,
    );
	if(!deleteId) return null
    return deleteId
  }
}
