// import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
// import { PostsViewModel } from '../../posts/posts.type';
// import { PostsRepository } from '../../posts/posts.repository';
// import { bodyPostsModelClass } from '../../posts/dto/posts.class.pipe';
// import { LikesRepository } from '../../likes/likes.repository';
// import { inputModelClass } from '../dto/blogs.class.pipe';
// import { PostClass } from '../../posts/post.class';

// export class CreateNewPostForBlogCommand {
//   constructor(
// 	public blogId: string,
//     public inputDataModel: bodyPostsModelClass,
// 	public blogName: string
//   ) {}
// }

// @CommandHandler(CreateNewPostForBlogCommand)
// export class CreateNewPostForBlogUseCase
//   implements ICommandHandler<CreateNewPostForBlogCommand>
// {
//   constructor(
// 	protected readonly postsRepository: PostsRepository,
// 	protected readonly likesRepository: LikesRepository
//   ) {}
//   async execute(command: CreateNewPostForBlogCommand): Promise<PostsViewModel | null> {
//     const newPost: PostClass = new PostClass(
//       command.inputDataModel.title,
//       command.inputDataModel.shortDescription,
//       command.inputDataModel.content,
//       command.blogId,
//       command.blogName,
//       0, 0
//     );
//     const createPost: PostClass | null = await this.postsRepository.createNewPosts(newPost)
// 	if(!createPost) return null
// 	const post = await this.postsRepository.findPostById(command.blogId)
//     if (!post) return null;
// 	const result = await this.likesRepository.getNewLike(post._id.toString(), command.blogId)
//     return createPost.getPostViewModel(result.myStatus, result.newestLikes);
//   }
// }
