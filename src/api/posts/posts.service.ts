import { Injectable } from "@nestjs/common"
import { PostsRepository } from "./posts.repository";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { LikeClass, LikeDocument } from "../../schema/likes.schema";
import { PostClass, PostDocument } from "../../schema/post.schema";
import { LikesRepository } from "../likes/likes.repository";
import { PostsViewModel } from "./posts.type";
import { ObjectId } from "mongodb";
import { LikeStatusEnum } from "../likes/likes.emun";




@Injectable()
export class PostsService {
  constructor(
    @InjectModel(PostClass.name) private postModel: Model<PostDocument>,
    @InjectModel(LikeClass.name) private likeModel: Model<LikeDocument>,
    protected postsRepository: PostsRepository,
    protected likesRepository: LikesRepository,
  ) {}
}