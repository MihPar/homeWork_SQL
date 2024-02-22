import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CommentClass } from "./comment.class";
import { LikeStatusEnum } from "../likes/likes.emun";

export class CommentRepository {
	constructor(
		@InjectDataSource() protected dataSource: DataSource
	) {}

	async deleteAllComments() {
		const deletedAll = await this.dataSource.query(`delete from public."Comments"`);
		return true
	}


	async increase(commentId: string, likeStatus: string, userId: string){
		if(likeStatus === LikeStatusEnum.None) {
			return true
		} else if(likeStatus === "Dislike") {
			const updateLikeCountQuery = `
				UPDATE public."Comments"
					SET "dislikesCount"="dislikesCount" + 1
					WHERE "id" = $1
			`
		const updateLikecount = (await this.dataSource.query(updateLikeCountQuery, [commentId]))[0]
		if(!updateLikecount) return false
		return true
		} else {
			const updatelikeCountQuery = `
				UPDATE public."Comments"
					SET "likesCount"="likesCount" + 1
					WHERE "id" = $1
			`
			const updatelikeCount = (await this.dataSource.query(updatelikeCountQuery, [commentId]))[0]
		if(!updatelikeCount) return false
			return true
		} 
	}

	async decrease(commentId: string, likeStatus: string, userId: string){
		if(likeStatus === LikeStatusEnum.None) {
			return true
		} else if(likeStatus === 'Dislike') {
			const updateLikeCountQuery = `
				UPDATE public."Comments"
					SET "dislikesCount"="dislikesCount" - 1
					WHERE "id" = $1
			`
			const updateLikeCount = (await this.dataSource.query(updateLikeCountQuery, [commentId]))[0]
			if(!updateLikeCount) return false
				return true
		} else {
			const updateLikeCountQuery = `
				UPDATE public."Comments"
					SET "likesCount"="likesCount" - 1
					WHERE "id" = $1
			`
			const updateLikeCount = (await this.dataSource.query(updateLikeCountQuery, [commentId]))[0]
			if(!updateLikeCount) return false
				return true
		} 
		
	}

	async updateComment(commentId: string, content: string): Promise<boolean> {
		const query = `
			UPDATE public."Comments"
				SET "content" = $1
				WHERE "id" = $2
		`
		const updateOne = (await this.dataSource.query(query, [content, commentId]))[0]
		if(!updateOne) return false
		return true
	  }

	  async deleteCommentByCommentId(commentId: string): Promise<boolean> {
		try {
			const query = `
				DELETE FROM public."Comments"
					WHERE "id" = $1
			`
		  const deleteComment = await this.dataSource.query(query, [commentId])
		  return true
		} catch (err) {
		  return false; 
		}
	  }

	  async createNewCommentPostId(newComment: CommentClass): Promise<CommentClass | null> {
		try {
			const query1 = `
				INSERT INTO public."Comments"(
					"content", "userId", "userLogin", "createdAt", "postId", "likesCount", "dislikesCount")
						VALUES ($1, $2, $3, $4, $5, $6, $7)
						returning *
			`;
      const createComments = (
        await this.dataSource.query(query1, [
          newComment.content,
          newComment.commentatorInfo.userId,
          newComment.commentatorInfo.userLogin,
          newComment.createdAt,
          newComment.postId,
		  newComment.likesCount,
		  newComment.dislikesCount,
        ])
      )[0];
      if (!createComments) return null;
			return {...createComments, commentatorInfo: {userId: createComments.userId, userLogin: createComments.userLogin}} 
		} catch (error) {
			console.log(error, 'error in create post');
			return null;
		  }
	  }
}