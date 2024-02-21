import { LikeStatusEnum } from "./likes.emun";

export class LikePost {
    constructor(
	  public id: string,
	  public userId: string,
	  public postId: string,
      public myStatus: LikeStatusEnum,
	  public addedAt: string
    ) {}
  }


  export class NewestLikesClass {
	constructor(
		public addedAT: string,
		public userId: string,
		public login: string,
		public postId: string,
		public myStatus: LikeStatusEnum,
	) {}
  }

  export class LikeComment {
    constructor(
	  public id: string,
	  public userId: string,
	  public commentId: string,
      public myStatus: LikeStatusEnum,
	  public addedAt: string
    ) {}
  }
