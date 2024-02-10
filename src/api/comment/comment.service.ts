import { ObjectId } from "mongodb";
import { CommentRepository } from "./comment.repository";
import { Injectable } from "@nestjs/common";
import { LikesRepository } from "../../api/likes/likes.repository";

@Injectable()
export class CommentService {
  constructor(
	protected commentRepositories: CommentRepository,
	protected likesRepository: LikesRepository
	) {}
}