import { ObjectId } from "mongodb";
import { LikeStatusEnum } from "./likes.emun";

export class Like {
    constructor(
	  public _id: ObjectId,
	  public userId: ObjectId,
	  public login: string,
	  public commentId: string,
	  public postId: string,
      public myStatus: LikeStatusEnum,
	  public addedAt: string
    ) {}
  }
