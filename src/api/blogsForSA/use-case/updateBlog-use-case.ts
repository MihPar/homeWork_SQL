import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { bodyBlogsModel } from "../dto/blogs.class-pipe";
import { BlogsRepositoryForSA } from "../blogsForSA.repository";

export class UpdateBlogForSACommand {
	constructor(
		public blogId: string,
		public inputDateMode: bodyBlogsModel,
	) {}
}

@CommandHandler(UpdateBlogForSACommand)
export class UpdateBlogForSAUseCase implements ICommandHandler<UpdateBlogForSACommand> {
  constructor(private readonly blogsRepositoryForSA: BlogsRepositoryForSA) {}
  async execute(command: UpdateBlogForSACommand): Promise<boolean> {
    const updateBlog = await this.blogsRepositoryForSA.updateBlogById(
      command.blogId,
      command.inputDateMode.name,
      command.inputDateMode.description,
      command.inputDateMode.websiteUrl,
    )
	if(!updateBlog) return false
	return true
  }
}