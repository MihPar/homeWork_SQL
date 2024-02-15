import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CommentClass } from "./comment.class";
import { zip } from "rxjs";
import { LikeStatusEnum } from "../likes/likes.emun";

export class CommentRepository {
	constructor(
		@InjectDataSource() protected dataSource: DataSource
	) {}

	// async deleteAllComments() {
	// 	const deletedAll = await this.commentModel.deleteMany({});
	// 	return deletedAll.deletedCount === 1;
	// }


	async increase(commentId: string, likeStatus: string){
		if(likeStatus !== 'Dislike' && likeStatus !== 'Like') {
			return
		} else if(likeStatus === "Dislike") {
			const query = `
				UPDATE public."Comments"
					SET "dislikesCount"=$1
					WHERE "id" = $2
			`
			return await this.dataSource.query(query, [1, commentId])
		} else if(likeStatus === "Like") {
			const query = `
				UPDATE public."Comments"
					SET "likesCount"=$1
					WHERE "id" = $2
			`
			return await this.dataSource.query(query, [1, commentId])
		} 
	}

	async decrease(commentId: string, likeStatus: string){
		if(likeStatus !== 'Dislike' && likeStatus !== 'Like') {
			return
		} else if(likeStatus === 'Dislike') {
			const query = `
				UPDATE public."Comments"
					SET "dislikesCount"=$1
					WHERE "id" = $2
			`
			return await this.dataSource.query(query, [-1, commentId])
		} else if(likeStatus === "Like") {
			const query = `
				UPDATE public."Comments"
					SET "likesCount"=$1
					WHERE "id" = $2
			`
			return await this.dataSource.query(query, [1, commentId])
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
					"content", "userId", "userLogin", "createdAt", "postId", "likesCount", "dislikesCount", "myStatus")
						VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
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
		  newComment.myStatus
        ])
      )[0];
      if (!createComments) return null;
    //   const query2 = `
	// 				select *
	// 					from public."Comments"
	// 					where "postId' = $1
	// 		`;
	// 		const getComment = (await this.dataSource.query(query2, [newComment.postId]))[0]
			// return getComment
			return createComments
		} catch (error) {
			console.log(error, 'error in create post');
			return null;
		  }
	  }
}