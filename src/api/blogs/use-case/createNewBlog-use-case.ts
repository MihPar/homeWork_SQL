import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { bodyBlogsModel } from "../dto/blogs.class.pipe";
import { BlogsViewType } from "../blogs.type";
import { BlogsRepositoryForSA } from "../../blogsForSA/blogsForSA.repository";
import { BlogClass } from "../blogs.class";

export class CreateNewBlogCommand {
	constructor(
		public inputDateModel: bodyBlogsModel
	) {}
}

@CommandHandler(CreateNewBlogCommand)
export class CreateNewBlogUseCase implements ICommandHandler<CreateNewBlogCommand> {
	constructor(
		protected readonly blogsRepositoryForSA: BlogsRepositoryForSA
	){}
	async execute(command: CreateNewBlogCommand): Promise<BlogsViewType | null> {
			const newBlog: BlogClass = new BlogClass (command.inputDateModel.name, command.inputDateModel.description, command.inputDateModel.websiteUrl, false)
			const createBlog: BlogClass | null= await this.blogsRepositoryForSA.createNewBlogs(newBlog);
			if(!createBlog) return null
			return BlogClass.createNewBlogForSA(createBlog);
	}
}