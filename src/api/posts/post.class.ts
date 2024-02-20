import { LikeStatusEnum } from "../likes/likes.emun";
import { LikesInfoModel, NewestLikesType } from "../likes/likes.type";
import { bodyPostsModelClass } from "./dto/posts.class.pipe";
import { PostsViewModel } from "./posts.type";

export class Posts {
	public createdAt: string;
	public extendedLikesInfo!: LikesInfoModel;
	constructor(
	  public title: string,
	  public shortDescription: string,
	  public content: string,
	  public blogId: string,
	  public blogName: string,
	  public likesCount: number,
	  public dislikesCount: number,
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
		title: string,
		shortDescription: string,
		content: string,
		blogId: string,
		blogName: string,
		likesCount: number, 
		dislikesCount: number, 
	) {
		super(title, shortDescription, content, blogId, blogName, likesCount, dislikesCount);
	}
	id: string;
	myStatus: LikeStatusEnum

	  static getPostsViewModel(post: PostClass,
		newestLikes: NewestLikesType[]): PostsViewModel {
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

	  static getPostsViewModelForSA(post: PostClass,
		newestLikes?: NewestLikesType[]): PostsViewModel {
		return {
		  id: post.id,
		  title: post.title,
		  shortDescription: post.shortDescription,
		  content: post.content,
		  blogId: post.blogId,
		  blogName: post.blogName,
		  createdAt: post.createdAt,
		  extendedLikesInfo: {
			  dislikesCount: post.dislikesCount, 
			  likesCount: post.likesCount, 
			  myStatus: post.myStatus || LikeStatusEnum.None,
			  newestLikes: newestLikes ? newestLikes.map(l => ({
				  addedAt: l.addedAt,
				  login: l.login,
				  userId: l.userId
			  })) : []},
		  };
	  }

	  static getPostsViewModelSAMyOwnStatus(post: PostClass,
		newestLikes: any[], myOwnStatus: LikeStatusEnum): PostsViewModel {
		return {
		  id: post.id,
		  title: post.title,
		  shortDescription: post.shortDescription,
		  content: post.content,
		  blogId: post.blogId,
		  blogName: post.blogName,
		  createdAt: post.createdAt,
		  extendedLikesInfo: {
			  dislikesCount: post.dislikesCount, 
			  likesCount: post.likesCount, 
			  myStatus: myOwnStatus || LikeStatusEnum.None,
			  newestLikes: newestLikes ? newestLikes.map(l => ({
				  addedAt: l.addedAt,
				  userId: l.userId, 
				  login: l.userName,
			  })) : []},
		  };
	  }

	  static updatePresentPost(post: PostClass, newData: bodyPostsModelClass): PostClass {
		  post.title = newData.title,
		  post.shortDescription = newData.shortDescription,
		  post.content = newData.content
		  return post
	  }

	  getPostViewModel(
		newestLikes: NewestLikesType[]): PostsViewModel {
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
			  likesCount: this.extendedLikesInfo.dislikesCount,
			  myStatus: this.myStatus,
			  newestLikes
		  },
		};
	  }
}