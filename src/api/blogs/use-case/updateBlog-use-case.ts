import { BlogsRepositoryForSA } from '../../blogsForSA/blogsForSA.repository';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { bodyBlogsModel } from "../dto/blogs.class.pipe";

export class UpdateBlogCommand {
	constructor(
		public blogId: string,
		public inputDateMode: bodyBlogsModel,
	) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private readonly blogsRepositoryForSA: BlogsRepositoryForSA) {}
  async execute(command: UpdateBlogCommand): Promise<boolean> {
    return await this.blogsRepositoryForSA.updateBlogById(
      command.blogId,
      command.inputDateMode.name,
      command.inputDateMode.description,
      command.inputDateMode.websiteUrl,
    );
  }
}