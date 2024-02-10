import { Injectable } from "@nestjs/common";
import { LikeClass, LikeDocument } from '../../schema/likes.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from "mongoose";
import { ObjectId } from "mongodb";
import { Like } from "./likes.class";
import { LikeStatusEnum } from "./likes.emun";

@Injectable()
export class LikesRepository {
	constructor(@InjectModel(LikeClass.name) private likeModel: Model<LikeDocument>) {}

	async deleteLikes() {
		const deleteAllLikes = await this.likeModel.deleteMany({});
    	return deleteAllLikes.deletedCount === 1;
	}

	async findLikePostByUser(postId: string, userId: string): Promise<Like | null> {
		return this.likeModel.findOne({userId, postId: postId}).lean() //
	}

	async saveLikeForPost(postId: string, userId: string, likeStatus: string, userLogin: string): Promise<string> {
		const saveResult = await this.likeModel.create({postId, userId, myStatus: likeStatus, login: userLogin, addedAt: new Date().toISOString()})
		return saveResult.id
	}

	async updateLikeStatusForPost(postId: string, userId: string, likeStatus: string) {
		const saveResult = await this.likeModel.updateOne({postId, userId}, {myStatus: likeStatus})
		return saveResult
	}

	async findLikeCommentByUser(commentId: string, userId: string) {
		return this.likeModel.findOne({userId,  commentId}).lean() //
	}

	async saveLikeForComment(commentId: string, userId: string, likeStatus: string) {
		const saveResult = await this.likeModel.create({commentId: commentId, userId: userId, myStatus: likeStatus, postId: null})
		const usesrComment = await this.likeModel.findOne({userId: userId, commentId: commentId}).lean() //
	}

	async updateLikeStatusForComment(commentId: string, userId: string, likeStatus: string){
		const saveResult = await this.likeModel.updateOne({commentId: commentId, userId: userId}, {myStatus: likeStatus})
		return saveResult
	}

	async getNewLike(postId: string, blogId: string) {
		const newestLikes = await this.likeModel
			  .find({ postId }) //
			  .sort({ addedAt: -1 })
			  .limit(3)
			  .skip(0)
			  .lean();
			let myStatus: LikeStatusEnum = LikeStatusEnum.None;
			if (blogId) {
			  const reaction = await this.likeModel.findOne({ blogId: new ObjectId(blogId) }, { __v: 0 }); //
			  myStatus = reaction
				? (reaction.myStatus as unknown as LikeStatusEnum)
				: LikeStatusEnum.None;
			}
			const result = {
				newestLikes, myStatus
			}
			return result
	}
}