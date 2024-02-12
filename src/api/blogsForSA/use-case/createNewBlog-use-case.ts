import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { bodyBlogsModel } from "../dto/blogs.class-pipe";
import { BlogsViewType } from "../blogs.type";
import { BlogClass } from "../../blogs/blogs.class";
import { BlogsRepositoryForSA } from "../blogs.repository";

export class CreateNewBlogCommand {
	constructor(
		public inputDateModel: bodyBlogsModel
	) {}
}

@CommandHandler(CreateNewBlogCommand)
export class CreateNewBlogUseCase
  implements ICommandHandler<CreateNewBlogCommand>
{
  constructor(protected readonly blogsRepositoryForSA: BlogsRepositoryForSA) {}
  async execute(command: CreateNewBlogCommand): Promise<BlogsViewType | null> {
    const newBlog: BlogClass = new BlogClass(
      command.inputDateModel.name,
      command.inputDateModel.description,
      command.inputDateModel.websiteUrl,
      false,
    );
    const createBlog: BlogClass | null =
      await this.blogsRepositoryForSA.createNewBlogs(newBlog);
    if (!createBlog) return null;
    return createBlog.getBlogViewModel();
  }
}