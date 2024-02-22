import { Injectable } from "@nestjs/common";
import { PaginationType } from "../../types/pagination.types";
import { PostsViewModel } from "./posts.type";
import { DataSource } from "typeorm";
import { InjectDataSource } from "@nestjs/typeorm";
import { PostClass, Posts } from "./post.class";
import { LikeStatusEnum } from "../likes/likes.emun";

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findPostsById(
    postId: string,
    userId?: string | null,
  ): Promise<PostsViewModel | null> {
	
    const queryPost = `
		SELECT *
			FROM public."Posts"
			WHERE "id" = $1
	  `;
    const post: PostClass | null = (await this.dataSource.query(queryPost, [postId]))[0]

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
	const LikesQuery = `
			select *
				from public."PostLikes" 
					where "postId" = $1 and "userId" = $2
		`;
		let myStatus: LikeStatusEnum = LikeStatusEnum.None;
		if(userId) {
			const userLike = (await this.dataSource.query(LikesQuery, [postId, userId]))[0];
			myStatus = userLike ? (userLike.myStatus as LikeStatusEnum) : LikeStatusEnum.None
		}
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
    let result: PaginationType<Posts> = {
      pagesCount: pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount,
      items: await Promise.all(
        allPosts.map(async (post) => {
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
	userId: string | null
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
					where "postId" = $1 and "userId" = $2
		`;

    const result: PaginationType<Posts> = {
      pagesCount: pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount,
      items: await Promise.all (findPostsByBlogId.map(async (post: PostClass)  => {
		let myStatus: LikeStatusEnum = LikeStatusEnum.None;
		if(userId) {
			const userLike = (await this.dataSource.query(LikesQuery, [post.id, userId]))[0];
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
