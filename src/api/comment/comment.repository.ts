import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CommentClass } from "./comment.class";

export class CommentRepository {
	constructor(
		@InjectDataSource() protected dataSource: DataSource
	) {}

	// async deleteAllComments() {
	// 	const deletedAll = await this.commentModel.deleteMany({});
	// 	return deletedAll.deletedCount === 1;
	// }


	// async increase(commentId: string, likeStatus: string){
	// 	if(likeStatus !== 'Dislike' && likeStatus !== 'Like') {
	// 		return
	// 	} 
	// 	return await this.commentModel.updateOne({_id: new ObjectId(commentId)}, {$inc: likeStatus === 'Dislike' ? {dislikesCount: 1} : {likesCount: 1}})
	// }

	// async decrease(commentId: string, likeStatus: string){
	// 	if(likeStatus !== 'Dislike' && likeStatus !== 'Like') {
	// 		return
	// 	} 
	// 	return await this.commentModel.updateOne({_id: new ObjectId(commentId)}, {$inc: likeStatus === 'Dislike' ? {dislikesCount: -1} : {likesCount: -1}})
	// }

	// async updateComment(commentId: string, content: string) {
	// 	const updateOne = await this.commentModel.updateOne(
	// 	  { _id: new ObjectId(commentId) },
	// 	  { $set: { content: content } }
	// 	);
	// 	return updateOne.matchedCount === 1;
	//   }

	//   async deleteComment(commentId: string): Promise<boolean> {
	// 	try {
	// 	  const deleteComment = await this.commentModel.deleteOne({
	// 		_id: new ObjectId(commentId),
	// 	  }).exec()
	// 	  return deleteComment.deletedCount === 1;
	// 	} catch (err) {
	// 	  return false; 
	// 	}
	//   }

	  async createNewCommentPostId(newComment: CommentClass): Promise<CommentClass | null> {
		try {
			const query1 = `
				INSERT INTO public."Comments"(
					"content", "userId", "userLogin", "createdAt", "postId")
					VALUES ('${newComment.content}', '${newComment.commentatorInfo.userId}', '${newComment.commentatorInfo.userLogin}', '${newComment.createdAt}', '${newComment.postId}');
			`
			const createComments = (await this.dataSource.query(query1))[0]
			if(!createComments) return null
			const query2 = `
					select *
						from public."Comments"
						where "postId' = $1
			`
			const getComment = (await this.dataSource.query(query2, [newComment.postId]))[0]
			return getComment
		} catch (error) {
			console.log(error, 'error in create post');
			return null;
		  }
	  }
}