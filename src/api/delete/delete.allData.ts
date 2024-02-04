import { Controller, Delete, HttpCode } from "@nestjs/common";
import { CommandBus } from '@nestjs/cqrs';
import { DeleteAllUsersCommnad } from "../users/useCase/deleteAllUsers-use-case";
import { DeleteAllDevicesCommnad } from "../security-devices/useCase/deleteAllDevices-use-case";

@Controller('testing/all-data')
export class DeleteAllDataController {
	constructor(
		// protected postsService: PostsService,
		// protected blogsService: BlogsService,
		// protected commentService: CommentService,
		// protected likesService: LikesService,
		protected commandBus: CommandBus
	) {}
	@Delete()
	@HttpCode(204)
	async deleteAllData() {
		// await this.commandBus.execute(new DeleteAllPostsComand())
		// await this.commandBus.execute(new DeleteAllBlogsCommnad())
		await this.commandBus.execute(new DeleteAllUsersCommnad())
		await this.commandBus.execute(new DeleteAllDevicesCommnad())
		// await this.commandBus.execute(new DeleteAllCommentsCommand())
		// await this.commandBus.execute(new DeleteAllLikesCommnad())
  }
}