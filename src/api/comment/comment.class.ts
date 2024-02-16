import { LikeStatusEnum } from "../likes/likes.emun";
import { likeInfoType } from "../likes/likes.type";
import { CommentViewModel, CommentatorInfoType } from "./comment.type";

export class Comment {
  public createdAt: string;
  public likesCount: number;
  public dislikesCount: number;
  constructor(
    public content: string,
    public postId: string,
    public commentatorInfo: CommentatorInfoType,
  ) {
    this.createdAt = new Date().toISOString();
    this.likesCount = 0;
    this.dislikesCount = 0;
  }
}


export class ComentatorInfoClass {
		userId: string
		userLogin: string
}

export class CommentClass extends Comment {
	constructor(
	  content: string,
	  postId: string,
	  commentatorInfo: CommentatorInfoType,
	) {
	  super(content, postId, commentatorInfo);
	}
		id: string
		likesCount: number
		dislikesCount: number

		getNewComment(myStatus: LikeStatusEnum): CommentViewModel {
			return {
			  id: this.id!.toString(),
			  content: this.content,
			  commentatorInfo: this.commentatorInfo,
			  createdAt: this.createdAt,
			  likesInfo: {
				likesCount: this.likesCount,
				dislikesCount: this.dislikesCount,
				myStatus: myStatus
			  }
			};
		  }
		
		static getNewComments(comment: CommentClass, myStatus: LikeStatusEnum): CommentViewModel {
			return {
			  id: comment.id,
			  content: comment.content,
			  commentatorInfo: comment.commentatorInfo,
			  createdAt: comment.createdAt,
			  likesInfo: {
				likesCount: comment.likesCount,
				dislikesCount: comment.dislikesCount,
				myStatus: myStatus
			  }
			};
		  }
}
