import { PostsRepository } from './../../posts/posts.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsViewModel } from '../../posts/posts.type';
import { bodyPostsModelClass } from '../../posts/dto/posts.class.pipe';
import { PostClass } from '../../posts/post.class';
import { inputModelUpdataPost } from '../dto/blogs.class-pipe';

export class UpdateExistingPostByIdWithBlogIdCommand {
  constructor(
	public dto: inputModelUpdataPost,
	public inputModel: bodyPostsModelClass
  ) {}
}

@CommandHandler(UpdateExistingPostByIdWithBlogIdCommand)
export class updateExistingPostByIdWithBlogIdUseCase
  implements ICommandHandler<UpdateExistingPostByIdWithBlogIdCommand>
{
  constructor(
	protected postsRepository: PostsRepository
  ) {}
  async execute(command: UpdateExistingPostByIdWithBlogIdCommand): Promise<PostsViewModel | null> {
	const findPostById: PostClass = await this.postsRepository.findPostByIdAndBlogId(command.dto.postId, command.dto.blogId)
	// console.log("findPostById: ", findPostById)
	if(!findPostById) return null
	const findNewestLike = await this.postsRepository.findNewestLike(command.dto.postId)
	const newPost = PostClass.updatePresentPost(findPostById, command.inputModel)
    const updateExistingPost: PostClass = await this.postsRepository.updatePost(newPost, command.dto.postId)
	if(!updateExistingPost) return null
	return PostClass.getPostsViewModelForSA(updateExistingPost, findNewestLike);
  }
}
