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
				from "Posts"
				where "id" = $1
		`
		return (this.dataSource.query(query, [postId]))[0]
	}

	async saveLikeForPost(postId: string, likeStatus: string): Promise<string> {
		const query1 = `
			UPDATE public."Posts"
				SET "myStatus"=${likeStatus}
				WHERE "id" = $1
		`
		const saveLikeForPost = (await this.dataSource.query(query1, [postId]))[0]

		const query2 = `
			UPDATE public."NewestLikes"
				SET "addedAt"=${new Date().toISOString()}
				WHERE "postId" = $1
		`;
		(await this.dataSource.query(query2, [postId]))[0]

		// const saveResult = await this.likeModel.create({postId, userId, myStatus: likeStatus, login: userLogin, addedAt: new Date().toISOString()})
		return saveLikeForPost.id
	}

	async updateLikeStatusForPost(postId: string, likeStatus: string) {
		const query1 = `
			UPDATE public."Posts"
				SET "myStatus"=${likeStatus}
				WHERE "id" = $1
		`
		const updateLikeStatus = (await this.dataSource.query(query1, [postId]))[0]
		return updateLikeStatus
	}

	// async findLikeCommentByUser(commentId: string, userId: string) {
	// 	return this.likeModel.findOne({userId,  commentId}).lean() //
	// }

	// async saveLikeForComment(commentId: string, userId: string, likeStatus: string) {
	// 	const saveResult = await this.likeModel.create({commentId: commentId, userId: userId, myStatus: likeStatus, postId: null})
	// 	const usesrComment = await this.likeModel.findOne({userId: userId, commentId: commentId}).lean() //
	// }

	// async updateLikeStatusForComment(commentId: string, userId: string, likeStatus: string){
	// 	const saveResult = await this.likeModel.updateOne({commentId: commentId, userId: userId}, {myStatus: likeStatus})
	// 	return saveResult
	// }

	async getNewLike(postId: string, blogId: string) {
		const query = `
			select *
				from "NewestLike"
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