// import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
// import { CommentRepository } from "../comment.repository";

// export class DeleteAllCommentsCommand {
// 	constructor() {}
// }

// @CommandHandler(DeleteAllCommentsCommand)
// export class DeleteAllCommentsUseCase implements ICommandHandler<DeleteAllCommentsCommand> {
// 	constructor(
// 		protected readonly commentRepository: CommentRepository
// 	) {}
//  	async execute(command: DeleteAllCommentsCommand): Promise<any> {
// 		return await this.commentRepository.deleteAllComments();
// 	}
// }