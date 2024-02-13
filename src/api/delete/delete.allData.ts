import { Controller, Delete, HttpCode } from "@nestjs/common";
import { CommandBus } from '@nestjs/cqrs';
import { DeleteAllUsersCommnad } from "../users/useCase/deleteAllUsers-use-case";
import { DeleteAllDevicesCommnad } from "../security-devices/useCase/deleteAllDevices-use-case";
import { SkipThrottle } from "@nestjs/throttler";
import { DeleteAllBlogsCommnad } from "../blogs/use-case/deletAllBlogs-use-case";
import { DeleteAllPostsComand } from "../posts/use-case/deleteAllPosts-use-case";
import { DeleteAllBlogsForSACommnad } from "../blogsForSA/use-case/deletAllBlogs-use-case";

// @SkipThrottle()
@Controller('testing/all-data')
export class DeleteAllDataController {
	constructor(
		protected commandBus: CommandBus
	) {}
	@Delete()
	@HttpCode(204)
	async deleteAllData() {
		await this.commandBus.execute(new DeleteAllPostsComand())
		await this.commandBus.execute(new DeleteAllBlogsCommnad())
		await this.commandBus.execute(new DeleteAllBlogsForSACommnad())
		await this.commandBus.execute(new DeleteAllDevicesCommnad())
		await this.commandBus.execute(new DeleteAllUsersCommnad())
		// await this.commandBus.execute(new DeleteAllCommentsCommand())
		// await this.commandBus.execute(new DeleteAllLikesCommnad())
  }
}