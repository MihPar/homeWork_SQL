import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { InputModelContent, inputModelCommentId } from "../dto/comment.class-pipe"
import { CommentRepository } from "../comment.repository";

export class UpdateCommentByCommentIdCommand {
	constructor(
		public commentId: string, 
		public dto: InputModelContent,
	) {}
}

@CommandHandler(UpdateCommentByCommentIdCommand)
export class UpdateCommentByCommentIdUseCase implements ICommandHandler<UpdateCommentByCommentIdCommand> {
	constructor(
		protected readonly commentRepository: CommentRepository
	) {}
	async execute(command: UpdateCommentByCommentIdCommand): Promise<boolean> {
		const updateCommentId = await this.commentRepository.updateComment(
			command.commentId,
			command.dto.content
		  );
		  return updateCommentId;
	}
}