import { Injectable } from "@nestjs/common";
import { Like } from "./likes.class";
import { LikeStatusEnum } from "./likes.emun";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@Injectable()
export class LikesRepository {
	constructor(
		@InjectDataSource() protected dataSource: DataSource
	) {}

	// async deleteLikes() {
	// 	const deleteAllLikes = await this.likeModel.deleteMany({});
    // 	return deleteAllLikes.deletedCount === 1;
	// }

	async findLikePostById(postId: string): Promise<Like | null> {
		const query = `
			select *
				from public."Posts"
				where "id" = $1
		`
		return (this.dataSource.query(query, [postId]))[0]
	}

	async saveLikeForPost(postId: string, likeStatus: string): Promise<string> {
		const query1 = `
			UPDATE public."NewestLikes"
				SET "myStatus"=${likeStatus}, "addedAt"=${new Date().toISOString()}
				WHERE "postId" = $1
		`
		const saveLikeForPost = (await this.dataSource.query(query1, [postId]))[0]

		// const saveResult = await this.likeModel.create({postId, userId, myStatus: likeStatus, login: userLogin, addedAt: new Date().toISOString()})
		return saveLikeForPost.id
	}

	async updateLikeStatusForPost(postId: string, likeStatus: string) {
		const query1 = `
			UPDATE public."NewestLikes"
				SET "myStatus"=${likeStatus}
				WHERE "postId" = $1
		`
		const updateLikeStatus = (await this.dataSource.query(query1, [postId]))[0]
		return updateLikeStatus
	}

	async findLikeByCommentIdByUserId(commentId: string, userId: string) {
		const query = `
			SELECT *
				FROM public."NewestLikes"
				WHERE "id" = $1 AND "userId" = $2
		`
		const findLike = await (this.dataSource.query(query, [commentId, userId]))[0]
		if(!findLike) return false
		return findLike
	}

	async saveLikeForComment(commentId: string, userId: string, likeStatus: string) {
		const query = `
			UPDATE public."NewestLikes"
				SET "myStatus"=$1
				WHERE "id" = $2 AND "userId" = $3
		`
		const saveResult = await this.dataSource.query(query, [likeStatus, commentId, userId])
	}

	async updateLikeStatusForComment(commentId: string, userId: string, likeStatus: string){
		const query = `
			UPDATE public."NewestLikes"
				SET "myStatus"=$1
				WHERE "id" = $2 AND "userId" = $3
		`
		const saveResult = (await this.dataSource.query(query, [likeStatus, commentId, userId]))[0]
		return saveResult
	}

	async getNewLike(postId: string, blogId: string) {
		const query = `
			select *
				from public."NewestLike"
				where "postId" = $1
				order by "addedAt" = desc
				limit 3 offset 0
		`
		const newestLike = (await this.dataSource.query(query, [postId]))[0]
		// const newestLikes = await this.likeModel
		// 	  .find({ postId }) //
		// 	  .sort({ addedAt: -1 })
		// 	  .limit(3)
		// 	  .skip(0)
		// 	  .lean();
		// 	let myStatus: LikeStatusEnum = LikeStatusEnum.None;
		// 	if (blogId) {
		// 	  const reaction = await this.likeModel.findOne({ blogId: new ObjectId(blogId) }, { __v: 0 }); //
		// 	  myStatus = reaction
		// 		? (reaction.myStatus as unknown as LikeStatusEnum)
		// 		: LikeStatusEnum.None;
		// 	}
		// 	const result = {
		// 		newestLikes, myStatus
		// 	}
			return newestLike
	}
}