import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CommentClass } from "./comment.class";

export class CommentRepository {
	constructor(
		@InjectDataSource() protected dataSource: DataSource
	) {}

	async deleteAllComments() {
		const deletedAll = await this.dataSource.query(`delete from public."Comments"`);
		return true
	}


	async increase(commentId: string, likeStatus: string, userId: string){
		if(likeStatus !== 'Dislike' && likeStatus !== 'Like') {
			return
		} else if(likeStatus === "Dislike") {
			const dislike = "Dislike"
			const updateLikeCountQuery = `
				UPDATE public."Comments"
					SET "dislikesCount"="dislikesCount" + 1
					WHERE "id" = $1
			`
		const updateLikecount = await this.dataSource.query(updateLikeCountQuery, [commentId])
		const updateLikeStatus = `
			update public."CommentLikes"
				set "myStatus"=$1
				where "commentId"=$2 and "userId"=$3
		`
		const updateLikes = await this.dataSource.query(updateLikeStatus, [likeStatus, commentId, userId])
		if(!updateLikecount && !updateLikes) return false
		return true
		} else if(likeStatus === "Like") {
			const updatelikeCountQuery = `
				UPDATE public."Comments"
					SET "likesCount"="likesCount" + 1
					WHERE "id" = $1
			`
			const updatelikeCount = await this.dataSource.query(updatelikeCountQuery, [commentId])
			const updateLikeStatus = `
				update public."CommentLikes"
					set "myStatus"=$1
					where "commentId"=$2 and "userId"=$3
			`
			const updateLikes = await this.dataSource.query(updateLikeStatus, [likeStatus, commentId, userId])
		if(!updatelikeCount && !updateLikes) return false
			return true
		} 
	}

	async decrease(commentId: string, likeStatus: string, userId: string){
		if(likeStatus !== 'Dislike' && likeStatus !== 'Like') {
			return
		} else if(likeStatus === 'Dislike') {
			const updateLikeCountQuery = `
				UPDATE public."Comments"
					SET "dislikesCount"="dislikesCount" - 1
					WHERE "id" = $1
			`
			const updateLikeCount = await this.dataSource.query(updateLikeCountQuery, [commentId])
			const updateLikesQuery = `
				UPDATE public."CommentLikes"
					SET "myStatus"=$1
					WHERE "commentId" = $1 AND "userId'=$3
			`
			const updateLike = await this.dataSource.query(updateLikesQuery, [likeStatus, commentId, userId])
			if(!updateLikeCount && !updateLike) return false
				return true
		} else if(likeStatus === "Like") {
			const updateLikeCountQuery = `
				UPDATE public."Comments"
					SET "likesCount"="likesCount" - 1
					WHERE "id" = $1
			`
			const updateLikeCount = await this.dataSource.query(updateLikeCountQuery, [commentId])
			const updateLikesQuery = `
				update public."CommentLikes"
					set "myStatus"=$1
					where "commentId"=$2 and "userId"=$3
			`
			const updateLike = await this.dataSource.query(updateLikesQuery, [likeStatus, commentId, userId])
			if(!updateLikeCount && !updateLike) return false
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