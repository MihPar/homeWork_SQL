import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UserClass } from "src/api/users/user.class";
import { UsersQueryRepository } from "src/api/users/users.queryRepository";
import { UsersRepository } from "src/api/users/users.repository";
import { EmailManager } from "src/infrastructura/email/email.manager";
import { WithId } from "typeorm";
import {v4 as uuidv4} from "uuid"


export class RecoveryPasswordCommand {
	constructor(
		public email: string,
	) {}
  }

  @CommandHandler(RecoveryPasswordCommand)
  export class RecoveryPasswordUseCase implements ICommandHandler<RecoveryPasswordCommand> {
	constructor(
		private usersQueryRepository: UsersQueryRepository,
		private emailManager: EmailManager,
		private usersRepository: UsersRepository
	) {}
	async execute(
		command: RecoveryPasswordCommand
	) {
		const recoveryCode = uuidv4();
		const findUser: WithId<UserClass | null> | null =
		  await this.usersQueryRepository.findUserByEmail(command.email);
		if (!findUser) {
		  return false;
		}
		try {
		  await this.emailManager.sendEamilRecoveryCode(command.email, recoveryCode);
		  await this.usersRepository.passwordRecovery(findUser._id, recoveryCode);
		  return true
		} catch (e) {
		  return false;
		// }
	}
  }
}