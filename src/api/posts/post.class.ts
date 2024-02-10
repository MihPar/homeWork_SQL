import { LikeStatusEnum } from "../likes/likes.emun";
import { LikesInfoModel, newestLikesType } from "../likes/likes.type";
import { PostsViewModel } from "./posts.type";

export class Posts {
	public createdAt: string;
	public extendedLikesInfo!: LikesInfoModel;
	constructor(
	  public id: string,
	  public title: string,
	  public shortDescription: string,
	  public content: string,
	  public blogId: string,
	  public blogName: string,
	  public likesCount: number,
	  public dislikesCount: number,
	  public myStatus: LikeStatusEnum
	) {
	  this.createdAt = new Date().toISOString();
	  this.extendedLikesInfo = {
		  dislikesCount: 0,
		  likesCount: 0,
	  }
	}
  }

export class PostClass extends Posts {
	constructor(
		id: string,
		title: string,
		shortDescription: string,
		content: string,
		blogId: string,
		blogName: string,
		likesCount: number, 
		dislikesCount: number, 
		myStatus: LikeStatusEnum
	) {
		super(id, title, shortDescription, content, blogId, blogName, likesCount, dislikesCount, myStatus);
	}
  	title: string;
  	shortDescription: string;
 	content: string;
  	blogId: string;
 	blogName: string;
  	createdAt: string;
  	likesCount: number
	dislikesCount: number
	myStatus: LikeStatusEnum

	  static getPostsViewModel(post: PostClass,
		newestLikes: newestLikesType[]): PostsViewModel {
		return {
		  id: post.id.toString(),
		  title: post.title,
		  shortDescription: post.shortDescription,
		  content: post.content,
		  blogId: post.blogId,
		  blogName: post.blogName,
		  createdAt: post.createdAt,
		  extendedLikesInfo: {
			  dislikesCount: post.dislikesCount, 
			  likesCount: post.likesCount, 
			  myStatus: post.myStatus,
			  newestLikes: newestLikes.map(l => ({
				  addedAt: l.addedAt,
				  login: l.login,
				  userId: l.userId
			  }))},
		  };
	  }
	  getPostViewModel(myStatus: LikeStatusEnum,
		newestLikes: newestLikesType[]): PostsViewModel {
		return {
		  id: this.id.toString(),
		  title: this.title,
		  shortDescription: this.shortDescription,
		  content: this.content,
		  blogId: this.blogId,
		  blogName: this.blogName,
		  createdAt: this.createdAt,
		  extendedLikesInfo: {
			  dislikesCount: this.extendedLikesInfo.dislikesCount, 
			  likesCount: this.extendedLikesInfo.likesCount, 
			  myStatus, 
			  newestLikes
		  },
		};
	  }
}