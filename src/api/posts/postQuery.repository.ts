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
    const queryPost = `
		SELECT *
			FROM public."Posts"
			WHERE "id" = $1
	  `;
    const post: PostClass | null = (await this.dataSource.query(queryPost, [postId]))[0]
	// console.log("post: ", post)

    const newestLikesQuery = `
			select *
				from public."PostLikes" 
					where "postId" = $1 and "myStatus" = 'Like'
					order by "addedAt" desc
					limit 3 
		`;
    const newestLikes = await this.dataSource.query(newestLikesQuery, [postId])
	console.log("newestLikes: ", newestLikes)

	// const likeCount = (await this.dataSource.query(
    // `
	// 	select count(*) 
	// 		from public."PostLikes" 
	// 		where "postId" = $1 and "myStatus" = 'Like'
	// 		`,
	// 		[postId]
  	// ))[0].count

	const LikesQuery = `
			select *
				from public."PostLikes" 
					where "postId" = $1 and "userId" = $2
		`;
		let myStatus: LikeStatusEnum = LikeStatusEnum.None;
		if(userId) {
			const myOwnStatus = (await this.dataSource.query(LikesQuery, [postId, userId]))[0];
			myStatus = myOwnStatus ? (myOwnStatus.myStatus as LikeStatusEnum) : LikeStatusEnum.None
		}
		// console.log(postId, "userId: ", userId)
		// console.log("userId: ", userId)
    return post ? PostClass.getPostsViewModelSAMyOwnStatus(post, newestLikes, myStatus) : null;
  }

  async findAllPosts(
    pageNumber: string,
    pageSize: string,
    sortBy: string,
    sortDirection: string,
    userId?: string | null
  ): Promise<PaginationType<Posts>> {
    const getPostQuery = `
			select *
				from "Posts"
				order by "${sortBy}" ${sortDirection}
				limit $1 offset $2
		`;
    const allPosts = await this.dataSource.query(getPostQuery, [
      +pageSize,
      (+pageNumber - 1) * +pageSize,
    ]);

    const countQuery = `
		select count(*)
			from "Posts"
	`;
    const totalCount = (await this.dataSource.query(countQuery))[0].count;
    const pagesCount: number = Math.ceil(+totalCount / +pageSize);
    const NewestLikesQuery = `
		select *
			from "PostLikes"
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
          const newestLikes = await this.dataSource.query(NewestLikesQuery, [post.id]);
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
    const GetPostsQuery = `
		SELECT *
			FROM public."Posts"
			WHERE "blogId" = $1
			ORDER BY "${sortBy}" ${sortDirection}
			LIMIT $2 OFFSET $3
	`;
    const findPostsByBlogId = await this.dataSource.query(GetPostsQuery, [
      blogId,
      +pageSize,
      (+pageNumber - 1) * +pageSize,
    ]);

    const countQuery = `
  		SELECT count(*)
  			FROM public."Posts"
  			WHERE "blogId" = $1
  `;
    const totalCount = (await this.dataSource.query(countQuery, [blogId]))[0].count;
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

  async getPostById(
    postId: string,
    userId?: string | null
  ): Promise<PostsViewModel | boolean> {
    const queryPost = `
		SELECT *
			FROM public."Posts"
			WHERE "id" = $1
	  `;
    const post: PostClass | null = (await this.dataSource.query(queryPost, [postId]))[0]
	if(!post) return false
	return true
  }
}
