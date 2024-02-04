import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { WithId } from "typeorm";
import {v4 as uuidv4} from "uuid"
import { UsersQueryRepository } from "../../users/users.queryRepository";
import { EmailManager } from "../../../infrastructura/email/email.manager";
import { UsersRepository } from "../../users/users.repository";
import { UserClass } from "../../users/user.class";


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
		const findUser: UserClass | null =
		  await this.usersQueryRepository.findUserByEmail(command.email);
		if (!findUser) {
		  return false;
		}
		try {
		  await this.emailManager.sendEamilRecoveryCode(command.email, recoveryCode);
		  await this.usersRepository.passwordRecovery(findUser.id, recoveryCode);
		  return true
		} catch (e) {
		  return false;
		// }
	}
  }
}