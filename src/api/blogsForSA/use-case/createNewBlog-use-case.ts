import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { bodyBlogsModel } from "../dto/blogs.class-pipe";
import { BlogsViewType } from "../blogs.type";
import { BlogClass } from "../../blogs/blogs.class";
import { BlogsRepositoryForSA } from "../blogs.repository";

export class CreateNewBlogForSACommand {
	constructor(
		public inputDateModel: bodyBlogsModel,
		public userId: string
	) {}
}

@CommandHandler(CreateNewBlogForSACommand) 
export class CreateNewBlogForSAUseCase
  implements ICommandHandler<CreateNewBlogForSACommand>
{
  constructor(protected readonly blogsRepositoryForSA: BlogsRepositoryForSA) {}
  async execute(
    command: CreateNewBlogForSACommand
  ): Promise<BlogsViewType | null> {
    const newBlog: BlogClass = new BlogClass(
      command.inputDateModel.name,
      command.inputDateModel.description,
      command.inputDateModel.websiteUrl,
      false
    );
    const createBlog: BlogClass | null =
      await this.blogsRepositoryForSA.createNewBlogs(newBlog);
    if (!createBlog) return null;
    return BlogClass.createNewBlogForSA(createBlog)
  }
}