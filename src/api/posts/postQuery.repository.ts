import { Injectable } from "@nestjs/common";
import { PaginationType } from "../../types/pagination.types";
import { PostsViewModel } from "./posts.type";
import { DataSource, ObjectId } from "typeorm";
import { InjectDataSource } from "@nestjs/typeorm";
import { PostClass, Posts } from "./post.class";
import { LikeStatusEnum } from "../likes/likes.emun";
import { query } from "express";

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findPostById(
    postId: string,
    userId?: string | null
  ): Promise<PostsViewModel | null> {
	// console.log("try")
    const queryPost = `
		SELECT *
			FROM public."Posts"
			WHERE "id" = $1
	  `;
    const post: PostClass | null = 
     ( await this.dataSource.query(queryPost, [postId]))[0]
    
    //  console.log("post: ", post)

    const query2 = `
			select *
				from public."NewestLikes" 
					where "postId" = $1
					order by "addedAt" desc
					limit 3 offset 0
		`;
    const newestLikes = await this.dataSource.query(query2, [postId])[0];

	const query3 = `
			select *
				from public."NewestLikes" 
					where "postId" = $1 and "userId" = $2
					order by "addedAt" desc
					limit 1 offset 0
		`;

	const myOwnStatus = await this.dataSource.query(query3, [postId, userId])[0];

    return post ? PostClass.getPostsViewModelSAMyOwnStatus(post, newestLikes, myOwnStatus) : null;
  }

  async findAllPosts(
    pageNumber: string,
    pageSize: string,
    sortBy: string,
    sortDirection: string,
    userId?: string | null
  ): Promise<PaginationType<Posts>> {
    const query1 = `
			select *
				from "Posts"
				order by "${sortBy}" ${sortDirection}
				limit $1 offset $2
		`;
    const allPosts = await this.dataSource.query(query1, [
      +pageSize,
      (+pageNumber - 1) * +pageSize,
    ]);

    const count = `
		select count(*)
			from "Posts"
	`;
    const totalCount = (await this.dataSource.query(count))[0].count;
    const pagesCount: number = Math.ceil(+totalCount / +pageSize);
    const query2 = `
		select *
			from "NewestLikes"
			where "postId" = $1
			order by "addedAt" desc
			limit 3 offset 0
	`;
    let result: PaginationType<Posts> = {
      pagesCount: pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount,
      items: await Promise.all(
        allPosts.map(async (post) => {
          const newestLikes = await this.dataSource.query(query2, [post.id]);
          return PostClass.getPostsViewModelForSA(post, newestLikes);
        })
      ),
    };
    return result;
  }

  async findPostsByBlogsId(
    pageNumber: string,
    pageSize: string,
    sortBy: string,
    sortDirection: string,
    blogId: string,
  ): Promise<PaginationType<Posts>> {
    const query1 = `
		SELECT *
			FROM public."Posts"
			WHERE "blogId" = $1
			ORDER BY "${sortBy}" ${sortDirection}
			LIMIT $2 OFFSET $3
	`;
    const findPostsByBlogId = await this.dataSource.query(query1, [
      blogId,
      +pageSize,
      (+pageNumber - 1) * +pageSize,
    ]);

    const count = `
  		SELECT count(*)
  			FROM public."Posts"
  			WHERE "blogId" = $1
  `;
    const totalCount = (await this.dataSource.query(count, [blogId]))[0].count;
    const pagesCount: number = Math.ceil(+totalCount / +pageSize);

    // const query2 = `
	// 		select *
	// 			from "NewestLikes"
	// 			where "postId" = $1
	// 	`;

    const result: PaginationType<Posts> = {
      pagesCount: pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount,
      items: findPostsByBlogId.map((post: PostClass)  =>
        // const newestLike = (await this.dataSource.query(query2, [post.id]))[0];
         PostClass.getPostsViewModelForSA(post)
      ),
    };
    return result;
  }
}
