import { Injectable } from "@nestjs/common"
import { PostsRepository } from "./posts.repository";
import { LikesRepository } from "../likes/likes.repository";




@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected likesRepository: LikesRepository,
  ) {}
}