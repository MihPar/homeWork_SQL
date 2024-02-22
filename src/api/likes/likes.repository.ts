import { Injectable } from "@nestjs/common";
import { LikeComment, LikePost } from "./likes.class";
import { LikeStatusEnum } from "./likes.emun";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@Injectable()
export class LikesRepository {
	constructor(
		@InjectDataSource() protected dataSource: DataSource
	) {}

	async deletePostLikes() {
		const deleteAllLikes = await this.dataSource.query(`
			DELETE FROM public."PostLikes"
		`);
    	return true
	}

	async deleteCommentLikes() {
		const deleteAllLikes = await this.dataSource.query(`
			DELETE FROM public."CommentLikes"
		`);
    	return true
	}

	async findLikeByPostId(postId: string, userId: string): Promise<LikePost | null> {
		const query = `
			select *
				from public."PostLikes"
				where "postId" = $1 and "userId" = $2
		`
		const findLike = (await this.dataSource.query(query, [postId, userId]))[0]
		if(!findLike) return null
		return findLike
	}

	async saveLikeForPost(postId: string, userId: string, likeStatus: string, login: string): Promise<string> {
		const createAddedAt = new Date().toISOString()
		const saveLikeForPostQuery = `
			INSERT INTO public."PostLikes"("userId", "postId", "myStatus", "addedAt")
				VALUES ($1, $2, $3, $4)
				returning *
		`
		const saveLikeForPost = (await this.dataSource.query(saveLikeForPostQuery, [userId, postId, likeStatus, createAddedAt]))[0]
		return saveLikeForPost.id
	}

	async updateLikeStatusForPost(postId: string, likeStatus: string, userId: string) {
		const addedAt = new Date().toISOString()
		const query1 = `
			UPDATE public."PostLikes"
				SET "myStatus"=$1, "addedAt"=$2
				WHERE "postId" = $3 AND "userId" = $4
		`
		const updateLikeStatus = (await this.dataSource.query(query1, [likeStatus, addedAt, postId, userId]))[0]
		return updateLikeStatus
	}

	async findLikeByCommentIdBy(commentId: string, userId: string): Promise<LikeComment | null>  {
		const commentLikesQuery = `
			SELECT *
				FROM public."CommentLikes"
					WHERE "commentId" = $1 AND "userId" = $2
		`
		const findLike = (await this.dataSource.query(commentLikesQuery, [commentId, userId]))[0]
		if(!findLike) return null
		return findLike
	}

	async saveLikeForComment(commentId: string, userId: string, likeStatus: string) {
		const createAddedAt = new Date().toISOString()
		const query = `
			INSERT INTO public."CommentLikes"("myStatus", "addedAt", "commentId", "userId")
				VALUES ($1, $2, $3, $4)
				RETURNING *
		`;
		const createLikeStatus = (await this.dataSource.query(query, [likeStatus, createAddedAt, commentId, userId]))[0]
		return createLikeStatus.id
	}

	async updateLikeStatusForComment(commentId: string, userId: string, likeStatus: string){
		const createAddedAt = new Date().toISOString()
		const query = `
			UPDATE public."CommentLikes"
				SET "myStatus"=$1, "addedAt"=$2
				WHERE "commentId" = $3 AND "userId" = $4
		`;
		const updateLikeStatus = (await this.dataSource.query(query, [likeStatus, createAddedAt, commentId, userId]))[0]
		return updateLikeStatus
	}

	async getNewLike(postId: string, blogId: string) {
		const NewestLikesQuery = `
			select *
				from public."PostLikes"	
				where "postId" = $1
				order by "addedAt" = desc
				limit 3 offset 0
		`
		const newestLike = (await this.dataSource.query(NewestLikesQuery, [postId]))[0]
		return newestLike
	}
}