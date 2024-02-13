import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { bodyBlogsModel, inputModelClass } from "../dto/blogs.class-pipe";
import { BlogsRepositoryForSA } from "../blogs.repository";

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
    return await this.blogsRepositoryForSA.updateBlogById(
      command.blogId,
      command.inputDateMode.name,
      command.inputDateMode.description,
      command.inputDateMode.websiteUrl,
    );
  }
}