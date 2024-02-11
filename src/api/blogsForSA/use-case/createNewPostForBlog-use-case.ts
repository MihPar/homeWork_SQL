import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsViewModel } from '../../posts/posts.type';
import { PostsRepository } from '../../posts/posts.repository';
import { LikesRepository } from '../../likes/likes.repository';
import { inputModelClass } from '../dto/blogs.class-pipe';
import { bodyPostsModelClass } from '../../posts/dto/posts.class.pipe';
import { PostClass } from '../../posts/post.class';
import { LikeStatusEnum } from '../../likes/likes.emun';

export class CreateNewPostForBlogCommand {
  constructor(
	public blogId: string,
    public inputDataModel: bodyPostsModelClass,
	public blogName: string
  ) {}
}

@CommandHandler(CreateNewPostForBlogCommand)
export class CreateNewPostForBlogUseCase
  implements ICommandHandler<CreateNewPostForBlogCommand>
{
  constructor(
	protected readonly postsRepository: PostsRepository,
	protected readonly likesRepository: LikesRepository
  ) {}
  async execute(command: CreateNewPostForBlogCommand): Promise<PostsViewModel | null> {
    const newPost: PostClass = new PostClass(
      command.inputDataModel.title,
      command.inputDataModel.shortDescription,
      command.inputDataModel.content,
      command.blogId,
      command.blogName,
      0, 0, LikeStatusEnum.None
    );
    const createPost: PostClass | null = await this.postsRepository.createNewPosts(newPost)
	if(!createPost) return null
	const post = await this.postsRepository.findPostById(command.blogId)
    if (!post) return null;
	const newestLike = await this.postsRepository.findNewestLike(post.id.toString())
	return createPost.getPostViewModel(newestLike);
  }
}
