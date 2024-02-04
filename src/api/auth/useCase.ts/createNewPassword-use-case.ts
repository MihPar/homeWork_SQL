import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InputModelNewPasswordClass } from "../dto/auth.class.pipe";
import { GenerateHashAdapter } from "../adapter/generateHashAdapter";
import { UsersQueryRepository } from "../../users/users.queryRepository";
import { UsersRepository } from "../../users/users.repository";

export class NewPasswordCommand {
	constructor(
	public inputDataNewPassword: InputModelNewPasswordClass,
	) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase implements ICommandHandler<NewPasswordCommand> {
	constructor(
		protected readonly usersQueryRepository: UsersQueryRepository,
		protected readonly usersRepository: UsersRepository,
		protected readonly generateHashAdapter: GenerateHashAdapter
	) {}
	async execute (
		command: NewPasswordCommand
	  ): Promise<boolean> {
		const findUserByCode = await this.usersQueryRepository.findUserByCode(
			command.inputDataNewPassword.recoveryCode
		);
		if (!findUserByCode) {
		  return false;
		}
		if (new Date(findUserByCode.expirationDate) < new Date()) {
		  return false;
		}
		const newPasswordHash = await this.generateHashAdapter._generateHash(command.inputDataNewPassword.newPassword);
		const resultUpdatePassword = await this.usersRepository.updatePassword(
		  findUserByCode.id,
		  newPasswordHash
		);
		if (!resultUpdatePassword) {
		  return false;
		}
		return true;
	  }
}