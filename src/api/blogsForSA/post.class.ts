import { LikeStatusEnum } from "../likes/likes.emun";
import { LikesInfoModel, newestLikesType } from "../likes/likes.type";
import { PostsViewModel } from "../posts/posts.type";

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
		) {
		  this.createdAt = new Date().toISOString();
		  this.extendedLikesInfo = {
			  dislikesCount: 0,
			  likesCount: 0,
		  }
		}
	  }
	  
	  export class PostsDB extends Posts {
		constructor(
		  id: string,
		  title: string,
		  shortDescription: string,
		  content: string,
		  blogId: string,
		  blogName: string,
		) {
		  super(id, title, shortDescription, content, blogId, blogName);
		}
		static getPostsViewModel(post: PostsDB, myStatus: LikeStatusEnum,
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
				dislikesCount: post.extendedLikesInfo.dislikesCount, 
				likesCount: post.extendedLikesInfo.likesCount, 
				myStatus, 
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