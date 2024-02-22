import { CommentViewType } from './../comment/comment.type';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaginationType } from '../../types/pagination.types';
import { InputModelClassPostId, InputModelContentePostClass } from './dto/posts.class.pipe';
import { PostsService } from './posts.service';
import { PostsQueryRepository } from './postQuery.repository';
import { BlogsQueryRepository } from '../blogs/blogs.queryReposity';
import { CommandBus } from '@nestjs/cqrs';
import { UserDecorator, UserIdDecorator } from '../../infrastructura/decorators/decorator.user';
import { UserClass } from '../users/user.class';
import { CheckRefreshTokenForPost } from './guards/bearer.authForPost';
import { InputModelLikeStatusClass } from '../comment/dto/comment.class-pipe';
import { CheckRefreshTokenForGet } from './guards/bearer.authGetComment';
import { CommentViewModel } from '../comment/comment.type';
import { CommentQueryRepository } from '../comment/comment.queryRepository';
import { Posts } from './post.class';
import { PostsViewModel } from './posts.type';
import { CreateNewCommentByPostIdCommnad } from '../comment/use-case/createNewCommentByPotsId-use-case';
import { UpdateLikeStatusCommand } from './use-case/updateLikeStatus-use-case';

// @SkipThrottle()
@Controller('posts')
export class PostController {
  constructor(
    protected postsQueryRepository: PostsQueryRepository,
    protected postsService: PostsService,
    protected blogsQueryRepository: BlogsQueryRepository,
	protected commentQueryRepository: CommentQueryRepository,
	protected commandBus: CommandBus
  ) {}

  @Put(':postId/like-status')
  @HttpCode(204)
  @UseGuards(CheckRefreshTokenForPost)
  async updateLikeStatus(
	@Param() dto: InputModelClassPostId, 
	@Body() status: InputModelLikeStatusClass,
	@UserDecorator() user: UserClass,
    @UserIdDecorator() userId: string | null,
	) {
	const commnad = new UpdateLikeStatusCommand(status, dto.postId, userId, user)
	const result = await this.commandBus.execute(commnad)
    if (!result) throw new NotFoundException('404')
	return
  }

  @Get(':postId/comments')
  @HttpCode(200)
  @UseGuards(CheckRefreshTokenForGet)
  async getCommentByPostId(
    @Param() dto: InputModelClassPostId, 
    @UserIdDecorator() userId: string | null,
    @UserDecorator() user: UserClass,
    @Query()
    query: {
      pageNumber: string;
      pageSize: string;
      sortBy: string;
      sortDirection: string;
    }
  ) {
    const isExistPots: PostsViewModel | boolean= await this.postsQueryRepository.getPostById(dto.postId);
    if (!isExistPots) throw new NotFoundException('Blogs by id not found');
    const commentByPostsId: PaginationType<CommentViewType> | null =
      await this.commentQueryRepository.findCommentsByPostId(
        dto.postId,
        (query.pageNumber || '1'),
        (query.pageSize || '10'),
        (query.sortBy || 'createdAt'),
        (query.sortDirection || 'desc'),
        userId,
      );
    if (!commentByPostsId) throw new NotFoundException('Blogs by id not found 404');
    return commentByPostsId;
  }

  @Post(':postId/comments')
  @HttpCode(201)
  @UseGuards(CheckRefreshTokenForPost)
  async createNewCommentByPostId(
	@Param() dto: InputModelClassPostId, 
	@Body() inputModelContent: InputModelContentePostClass,
  	@UserDecorator() user: UserClass,
	@UserIdDecorator() userId: string | null
	) {
    const post: PostsViewModel | boolean = await this.postsQueryRepository.getPostById(dto.postId)
    if (!post) throw new NotFoundException('Blogs by id not found 404')
	const command = new CreateNewCommentByPostIdCommnad(dto.postId, inputModelContent, user)
	const createNewCommentByPostId: CommentViewModel | null = await this.commandBus.execute(command)
	return createNewCommentByPostId
  }

  @Get()
  @HttpCode(200)
  @UseGuards(CheckRefreshTokenForGet)
  async getPosts(
    @UserIdDecorator() userId: string | null,
    @Query()
    query: {
      pageNumber: string;
      pageSize: string;
      sortBy: string;
      sortDirection: string;
    },
  ) {
    const getAllPosts: PaginationType<Posts> =
      await this.postsQueryRepository.findAllPosts(
        (query.pageNumber || '1'),
        (query.pageSize || '10'),
        (query.sortBy || 'createdAt'),
        (query.sortDirection || 'desc'),
        userId,
      );
    return getAllPosts;
  }

//   @Post()
//   @HttpCode(201)
//   @UseGuards(AuthBasic)
//   async createPost(@Body(new ValidationPipe({ validateCustomDecorators: true })) inputModelPost: inputModelPostClass) {
//     const findBlog: BlogClass | null = await this.blogsQueryRepository.findRawBlogById(
//       inputModelPost.blogId,
//     );
//     if (!findBlog) throw new BadRequestException('Blogs by id not found 400');
// 	const command = new CreatePostCommand(inputModelPost, findBlog.name)
// 	const createNewPost: Posts | null = await this.commandBus.execute(command)
// 	if(!createNewPost) throw new BadRequestException('Blogs by id not found 400');
//     return createNewPost;
//   }

  @Get(':postId')
  @HttpCode(200)
  @UseGuards(CheckRefreshTokenForGet)
  async getPostById(
    @Param() dto: InputModelClassPostId, 
	@UserIdDecorator() userId: string | null,
	@UserDecorator() user: UserClass
  ) {
    const getPostById: PostsViewModel | null =
      await this.postsQueryRepository.findPostsById(dto.postId, userId);
    if (!getPostById) {
      throw new NotFoundException('Post by id not found');
    }
    return getPostById;
  }

//   @Put(':postId')
//   @HttpCode(204)
//   @UseGuards(AuthBasic)
//   async updatePostById(
//     @Param() dto: InputModelClassPostId, 
//     @Body(new ValidationPipe({ validateCustomDecorators: true })) inputModelData: inputModelPostClass,
//   ) {
// 	const command = new UpdateOldPostCommand(dto.postId, inputModelData)
// 	const updatePost: boolean = await this.commandBus.execute(command)
//     if (!updatePost) throw new NotFoundException('Blogs by id not found 404');
//     return
//   }

//   @Delete(':id')
//   @HttpCode(204)
//   @UseGuards(AuthBasic)
//   async deletePostById(@Param('id') id: string, ): Promise<boolean> {
// 	const command = new DeletePostByIdCommand(id)
// 	const deletPost: boolean = await this.commandBus.execute(command)
//     if (!deletPost) throw new NotFoundException('Blogs by id not found 404');
//     return true;
//   }
}
