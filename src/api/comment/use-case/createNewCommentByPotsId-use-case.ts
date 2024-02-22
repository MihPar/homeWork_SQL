import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentViewModel } from "../comment.type";
import { CommentRepository } from "../comment.repository";
import { LikeStatusEnum } from "../../likes/likes.emun";
import { NotFoundException } from "@nestjs/common";
import { InputModelContentePostClass } from "../../posts/dto/posts.class.pipe";
import { UserClass } from "../../users/user.class";
import { CommentClass } from "../comment.class";

export class CreateNewCommentByPostIdCommnad {
  constructor(
    public postId: string,
    public inputModelContent: InputModelContentePostClass,
    public user: UserClass,
  ) {}
}

@CommandHandler(CreateNewCommentByPostIdCommnad)
export class CreateNewCommentByPostIdUseCase
  implements ICommandHandler<CreateNewCommentByPostIdCommnad>
{
  constructor(protected readonly commentRepository: CommentRepository) {}
  async execute(
    command: CreateNewCommentByPostIdCommnad
  ): Promise<CommentViewModel | null> {
    const userLogin = command.user.userName;
    if (!command.user.id) return null;
    const userId = command.user.id;
    const newComment: CommentClass = new CommentClass(
      command.inputModelContent.content,
      command.postId,
      { userId, userLogin }
    );
    const createNewComment: CommentClass | null =
      await this.commentRepository.createNewCommentPostId(newComment);
    if (!createNewComment) throw new NotFoundException("404");
    return CommentClass.getNewComments(createNewComment, LikeStatusEnum.None);
  }
}
