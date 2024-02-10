import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { bodyBlogsModel, inputModelClass } from "../blogs.class";
import { BlogsRepository } from "../blogs.repository";

export class UpdateBlogCommand {
	constructor(
		public blogId: string,
		public inputDateMode: bodyBlogsModel,
	) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}
  async execute(command: UpdateBlogCommand): Promise<boolean> {
    return await this.blogsRepository.updateBlogById(
      command.blogId,
      command.inputDateMode.name,
      command.inputDateMode.description,
      command.inputDateMode.websiteUrl,
    );
  }
}