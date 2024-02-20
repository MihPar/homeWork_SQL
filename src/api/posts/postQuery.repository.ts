import { Injectable } from "@nestjs/common";
import { PaginationType } from "../../types/pagination.types";
import { PostsViewModel } from "./posts.type";
import { DataSource, ObjectId } from "typeorm";
import { InjectDataSource } from "@nestjs/typeorm";
import { PostClass, Posts } from "./post.class";
import { LikeStatusEnum } from "../likes/likes.emun";
import { query } from "express";
import { UserClass } from "../users/user.class";

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findPostsById(
    postId: string,
    userId?: string | null,
  ): Promise<PostsViewModel | null> {
	
	// const getUserNameQuery = `
	// 	select u."userName"
	// 		from public."Users" as u
	// 		where "id"=$1
	// `
	// const getUserName = (await this.dataSource.query(getUserNameQuery, [userId]))[0]
	// const userLogin = getUserName.userName

    const queryPost = `
		SELECT *
			FROM public."Posts"
			WHERE "id" = $1
	  `;
    const post: PostClass | null = (await this.dataSource.query(queryPost, [postId]))[0]
	console.log("post: ", post)

    const newestLikesQuery = `
			select *
				from public."PostLikes" as pl
				left join public."Users" as u
				on pl."userId" = u."id"
					where "postId" = $1 and "myStatus" = 'Like'
					order by "addedAt" desc
					limit 3 
		`;
    const newestLikes = await this.dataSource.query(newestLikesQuery, [postId])
	// console.log("newestLikes: ", newestLikes)

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
		// console.log("userId: ", userId)
		if(userId) {
			const userLike = (await this.dataSource.query(LikesQuery, [postId, userId]))[0];
			
// console.log("userLike: ", userLike)
			myStatus = userLike ? (userLike.myStatus as LikeStatusEnum) : LikeStatusEnum.None
		}
		// console.log("myStatus: ", myStatus)
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

	const newestLikesQuery = `
			select *
				from public."PostLikes" as pl
				left join public."Users" as u
				on pl."userId" = u."id"
					where "postId" = $1 and "myStatus" = 'Like'
					order by "addedAt" desc
					limit 3 
		`;
	const LikesQuery = `
			select *
				from public."PostLikes" 
					where "postId" = $1 and "userId" = $2
		`;

    // const NewestLikesQuery = `
	// 	select *
	// 		from "PostLikes"
	// 		where "postId" = $1
	// 		order by "addedAt" desc
	// 		limit 3 offset 0
	// `;
    let result: PaginationType<Posts> = {
      pagesCount: pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount,
      items: await Promise.all(
        allPosts.map(async (post) => {
        //   const newestLikes = await this.dataSource.query(NewestLikesQuery, [post.id]);
		let myStatus: LikeStatusEnum = LikeStatusEnum.None;
		if(userId) {
			const userLike = (await this.dataSource.query(LikesQuery, [post.id, userId]))[0];
			myStatus = userLike ? (userLike.myStatus as LikeStatusEnum) : LikeStatusEnum.None
		}
		const newestLikes = await this.dataSource.query(newestLikesQuery, [post.id])
          return PostClass.getPostsViewModelSAMyOwnStatus(post, newestLikes, myStatus);
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
    const getPostsQuery = `
		SELECT *
			FROM public."Posts"
			WHERE "blogId" = $1
			ORDER BY "${sortBy}" ${sortDirection}
			LIMIT $2 OFFSET $3
	`;
    const findPostsByBlogId = await this.dataSource.query(getPostsQuery, [
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

	const newestLikesQuery = `
			select *
			from public."PostLikes" as pl
			left join public."Users" as u
			on pl."userId" = u."id"
				where "postId" = $1 and "myStatus" = 'Like'
				order by "addedAt" desc
				limit 3 
		`;
	const LikesQuery = `
			select *
				from public."PostLikes" 
					where "postId" = $1
		`;

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
      items: await Promise.all (findPostsByBlogId.map(async (post: PostClass)  => {
        // const newestLike = (await this.dataSource.query(query2, [post.id]))[0];
		let myStatus: LikeStatusEnum = LikeStatusEnum.None;
		if(blogId) {
			const userLike = (await this.dataSource.query(LikesQuery, [post.id]))[0];
			myStatus = userLike ? (userLike.myStatus as LikeStatusEnum) : LikeStatusEnum.None
		}
		const newestLikes = await this.dataSource.query(newestLikesQuery, [post.id])
         return PostClass.getPostsViewModelSAMyOwnStatus(post, newestLikes, myStatus)
		}
      ))
    };
	console.log("result: ", result)
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
