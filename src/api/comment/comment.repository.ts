import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CommentClass } from "./comment.class";
import { zip } from "rxjs";
import { LikeStatusEnum } from "../likes/likes.emun";

export class CommentRepository {
	constructor(
		@InjectDataSource() protected dataSource: DataSource
	) {}

	async deleteAllComments() {
		const deletedAll = await this.dataSource.query(`delete from public."Comments"`);
		return true
	}


	async increase(commentId: string, likeStatus: string){
		if(likeStatus !== 'Dislike' && likeStatus !== 'Like') {
			return
		} else if(likeStatus === "Dislike") {
			const query = `
				UPDATE public."Comments"
					SET "dislikesCount"="dislikesCount" + 1
					WHERE "id" = $1
			`
			return await this.dataSource.query(query, [commentId])
		} else if(likeStatus === "Like") {
			const query = `
				UPDATE public."Comments"
					SET "likesCount"="likesCount" + 1
					WHERE "id" = $1
			`
			return await this.dataSource.query(query, [commentId])
		} 
	}

	async decrease(commentId: string, likeStatus: string){
		if(likeStatus !== 'Dislike' && likeStatus !== 'Like') {
			return
		} else if(likeStatus === 'Dislike') {
			const query = `
				UPDATE public."Comments"
					SET "dislikesCount"="dislikesCount" - 1
					WHERE "id" = $1
			`
			return await this.dataSource.query(query, [commentId])
		} else if(likeStatus === "Like") {
			const query = `
				UPDATE public."Comments"
					SET "likesCount"="likesCount" - 1
					WHERE "id" = $1
			`
			return await this.dataSource.query(query, [commentId])
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
						VALUES ($1, $2, $3, $4, $5, $6, $7);
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
	  const query2 = `
		select *
			from "Comments"
			where "content" = $1
	  `
	  const getComment = (await this.dataSource.query(query2, [newComment.content]))[0]
      if (!getComment) return null;
			return {...getComment, commentatorInfo: {userId: getComment.userId, userLogin: getComment.userLogin}} 
		} catch (error) {
			console.log(error, 'error in create post');
			return null;
		  }
	  }
}