import { CommandBus } from '@nestjs/cqrs';
import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Put, Query, UseFilters, UseGuards, ValidationPipe } from "@nestjs/common";
import { BlogsQueryRepository } from "./blogs.queryReposity";
import { bodyBlogsModel, inputModelClass } from "./dto/blogs.class.pipe";
import { BlogsViewType } from "./blogs.type";
import { bodyPostsModelClass } from "../posts/dto/posts.class.pipe";
import { PostsService } from "../posts/posts.service";
import { PostsQueryRepository } from "../posts/postQuery.repository";
import { PaginationType } from "../../types/pagination.types";
import { CreateNewBlogCommand } from './use-case/createNewBlog-use-case';
import { UpdateBlogCommand } from './use-case/updateBlog-use-case';
import { SkipThrottle } from '@nestjs/throttler';
import { CheckRefreshTokenForGet } from './use-case/bearer.authGetComment';
import { UserDecorator, UserIdDecorator } from '../../infrastructura/decorators/decorator.user';
import { UserClass } from '../users/user.class';
import { Posts } from '../posts/post.class';

// @SkipThrottle()
@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
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
      await this.blogsQueryRepository.findAllBlogs(
        query.searchNameTerm ?? '',
		(query.sortBy || 'createdAt'),
		(query.sortDirection || 'desc'),
        (query.pageNumber || '1'),
        (query.pageSize || '10'),
      );
	//   console.log("getAllBlogs: ", getAllBlogs)
    return getAllBlogs;
  }

//   @Post()
//   @HttpCode(201)
//   @UseGuards(AuthBasic)
//   async createBlog(@Body(new ValidationPipe({ validateCustomDecorators: true })) inputDateModel: bodyBlogsModel) {
// 	const command = new CreateNewBlogCommand(inputDateModel)
// 	const createBlog: BlogsViewType = await this.commandBus.execute(command)
//     return createBlog;
//   }
  
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
	// console.log("blog")
    const blog = await this.blogsQueryRepository.findBlogById(dto.blogId);
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
	console.log("getPosts: ", getPosts)
    return getPosts;
  }

//   @HttpCode(201)
//   @Post(':blogId/posts')
//   @UseGuards(AuthBasic)
//   async createPostByBlogId(
//     @Param() dto: inputModelClass,
//     @Body(new ValidationPipe({ validateCustomDecorators: true })) inputDataModel: bodyPostsModelClass,
//   ) {
//     const findBlog: BlogsViewType | null = await this.blogsQueryRepository.findBlogById(dto.blogId);
//     if (!findBlog) throw new NotFoundException('Blogs by id not found 404');
// 	const command = new CreateNewPostForBlogCommand( dto.blogId, inputDataModel, findBlog.name)
// 	const createNewPost: Posts | null = await this.commandBus.execute(command)
//     if (!createNewPost) throw new NotFoundException('Blogs by id not found 404');
//     return createNewPost;
//   }

  @Get(':blogId')
  @HttpCode(200)
  async getBlogsById(
    @Param() dto: inputModelClass,
  ): Promise<BlogsViewType | null> {
	// console.log("try")
    const blogById: BlogsViewType | null =
      await this.blogsQueryRepository.findBlogById(dto.blogId);
    if (!blogById) throw new NotFoundException('Blogs by id not found 404');
    return blogById;
  }

//   @Put(':blogId')
//   @HttpCode(204)
//   @UseGuards(AuthBasic)
//   @UseFilters(new HttpExceptionFilter())
//   async updateBlogsById(
//     @Param() dto: inputModelClass,
//     @Body(new ValidationPipe({ validateCustomDecorators: true })) inputDateMode: bodyBlogsModel,
//   ) {
// 	const command = new UpdateBlogCommand(dto.blogId, inputDateMode)
// 	const isUpdateBlog = await this.commandBus.execute(command)
//     if (!isUpdateBlog) throw new NotFoundException('Blogs by id not found 404');
// 	return isUpdateBlog
//   }

//   @Delete(':id')
//   @HttpCode(204)
//   @UseGuards(AuthBasic)
//   async deleteBlogsById(@Param('id') id: string) {
//     const isDeleted: boolean = await this.blogsRepository.deletedBlog(id);
//     if (!isDeleted) throw new NotFoundException('Blogs by id not found 404');
//     return isDeleted;
//   }
}