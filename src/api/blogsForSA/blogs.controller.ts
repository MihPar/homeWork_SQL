import { CommandBus } from '@nestjs/cqrs';
import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, HttpCode, NotFoundException, Param, Post, Put, Query, UseFilters, UseGuards, ValidationPipe } from "@nestjs/common";
import { bodyBlogsModel, inputModelClass, inputModelUpdataPost } from "./dto/blogs.class-pipe";
import { BlogsViewType } from "./blogs.type";
import { PostsService } from "../posts/posts.service";
import {BlogsRepositoryForSA } from "./blogs.repository";
import { PostsQueryRepository } from "../posts/postQuery.repository";
import { PaginationType } from "../../types/pagination.types";
import { CreateNewBlogCommand } from './use-case/createNewBlog-use-case';
import { UpdateBlogCommand } from './use-case/updateBlog-use-case';
import { CreateNewPostForBlogCommand } from './use-case/createNewPostForBlog-use-case';
import { AuthBasic } from '../users/gards/basic.auth';
import { SkipThrottle } from '@nestjs/throttler';
import { HttpExceptionFilter } from '../../infrastructura/exceptionFilters.ts/exceptionFilter';
import { CheckRefreshTokenForGet } from '../blogs/use-case/bearer.authGetComment';
import { UserDecorator, UserIdDecorator } from '../../infrastructura/decorators/decorator.user';
import { UserClass } from '../users/user.class';
import { ForbiddenCalss } from '../security-devices/gards/forbidden';
import { Posts } from '../posts/post.class';
import { bodyPostsModelClass } from '../posts/dto/posts.class.pipe';
import { BlogsQueryRepositoryForSA } from './blogs.queryReposity';
import { PostsRepository } from '../posts/posts.repository';
import { UpdateExistingPostByIdWithBlogIdCommand } from './use-case/updatePostByIdWithBlogId-use-case';
import { DeletePostByIdCommand } from './use-case/deletPostById-use-case';

@SkipThrottle()
@Controller('sa/blogs')
@UseGuards(AuthBasic)
@UseGuards(ForbiddenCalss)
export class BlogsControllerForSA {
  constructor(
    protected blogsQueryRepositoryForSA: BlogsQueryRepositoryForSA,
    protected postsQueryRepository: PostsQueryRepository,
    protected blogsRepositoryForSA: BlogsRepositoryForSA,
	protected postsRepository: PostsRepository,
	protected commandBus: CommandBus
  ) {}

  @Get()
  @HttpCode(200)
  async getBlogsWithPagin(
    @Query()
    query: {
      searchNameTerm: string;
      sortBy: string;
      sortDirection: string;
      pageNumber: string;
      pageSize: string;
    },
  ) {
    const getAllBlogs: PaginationType<BlogsViewType> =
      await this.blogsQueryRepositoryForSA.findAllBlogs(
        query.searchNameTerm,
		(query.sortBy || 'createdAt'),
		(query.sortDirection || 'desc'),
        (query.pageNumber || '1'),
        (query.pageSize || '10'),
      );
    return getAllBlogs;
  }

  @Post()
  @HttpCode(201)
  async createBlog(@Body(new ValidationPipe({ validateCustomDecorators: true })) inputDateModel: bodyBlogsModel) {
	const command = new CreateNewBlogCommand(inputDateModel)
	const createBlog: BlogsViewType = await this.commandBus.execute(command)
    return createBlog;
  }

  @Put(':blogId')
  @HttpCode(204)
  async updateBlogsById(
    @Param() dto: inputModelClass,
    @Body(new ValidationPipe({ validateCustomDecorators: true })) inputDateMode: bodyBlogsModel,
	@UserDecorator() user: UserClass,
	@UserIdDecorator() userId: string,
  ) {
	const isExistBlog = await this.blogsQueryRepositoryForSA.findBlogById(dto.blogId, userId)
	if(!isExistBlog) throw new  ForbiddenException("403")
	const command = new UpdateBlogCommand(dto.blogId, inputDateMode)
	const isUpdateBlog = await this.commandBus.execute(command)
    if (!isUpdateBlog) throw new NotFoundException('Blogs by id not found 404');
	return true
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteBlogsById(
	@Param('id') id: string,
	@UserDecorator() user: UserClass,
	@UserIdDecorator() userId: string,
	) {
	const isExistBlog = await this.blogsQueryRepositoryForSA.findBlogById(id, userId)
	if(!isExistBlog) throw new  ForbiddenException("403")
    const isDeleted: boolean | null = await this.blogsRepositoryForSA.deletedBlog(id);
    if (!isDeleted) throw new NotFoundException('Blogs by id not found 404');
    return isDeleted;
  }

  @HttpCode(201)
  @Post(':blogId/posts')
  async createPostByBlogId(
    @Param() dto: inputModelClass,
    @Body(new ValidationPipe({ validateCustomDecorators: true })) inputDataModel: bodyPostsModelClass,
  ) {
    const findBlog: BlogsViewType | null = await this.blogsQueryRepositoryForSA.findBlogById(dto.blogId);
    if (!findBlog) throw new NotFoundException('Blogs by id not found 404');
	const command = new CreateNewPostForBlogCommand( dto.blogId, inputDataModel, findBlog.name)
	const createNewPost: Posts | null = await this.commandBus.execute(command)
    if (!createNewPost) throw new NotFoundException('Blogs by id not found 404');
    return createNewPost;
  }
  
  @Get(':blogId/posts')
  @HttpCode(200)
  @UseGuards(CheckRefreshTokenForGet)
  async getPostsByBlogId(
    @Param() dto: inputModelClass,
	@UserDecorator() user: UserClass,
	@UserIdDecorator() userId: string | null,
    @Query()
    query: {
      pageNumber: string;
      pageSize: string;
      sortBy: string;
      sortDirection: string;
    },
  ) {
    const blog = await this.blogsQueryRepositoryForSA.findBlogById(dto.blogId);
    if (!blog) throw new NotFoundException('Blogs by id not found');
    const getPosts: PaginationType<Posts> =
      await this.postsQueryRepository.findPostsByBlogsId(
        query.pageNumber || '1',
        query.pageSize || '10',
        query.sortBy || 'createdAt',
        query.sortDirection || 'desc',
        dto.blogId,
      );
    if (!getPosts) throw new NotFoundException('Blogs by id not found');
    return getPosts;
  }

  @Get(':blogId/posts/:postId')
  @HttpCode(204)
  async updatePostByIdWithModel(@Param() dto: inputModelUpdataPost, @Body() inputModel: bodyPostsModelClass) {
const command = new UpdateExistingPostByIdWithBlogIdCommand(dto, inputModel)
	const updateExistingPost = await this.commandBus.execute(command)
	if(!updateExistingPost) throw new NotFoundException("Post not find")
  }

  @Delete(':blogId/posts/:postId')
  @HttpCode(204)
  async deletePostByIdWithBlogId(@Param() dto: inputModelUpdataPost) {
	const command = new DeletePostByIdCommand(dto)
	const deletePostById = await this.commandBus.execute(command)
	if(!deletePostById) throw new NotFoundException("Post not find")
  }
}