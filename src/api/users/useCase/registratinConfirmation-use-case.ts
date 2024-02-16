import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../users.queryRepository';
import { UsersRepository } from '../users.repository';
import { InputDateReqConfirmClass } from '../../auth/dto/auth.class.pipe';
import { BadRequestException } from '@nestjs/common';

export class RegistrationConfirmationCommand {
  constructor(public inputDateRegConfirm: InputDateReqConfirmClass) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase
  implements ICommandHandler<RegistrationConfirmationCommand>
{
  constructor(
    protected readonly usersQueryRepository: UsersQueryRepository,
    protected readonly usersRepository: UsersRepository,
  ) {}
  async execute(command: RegistrationConfirmationCommand) {
    const user = await this.usersQueryRepository.findUserByConfirmation(
      command.inputDateRegConfirm.code,
    );
	if(user!.isConfirmed) {
		throw new BadRequestException([{message: 'Incorrect code!', field: 'code'}])
	}
    const result = await this.usersRepository.updateConfirmation(user!.id);
    return result;
  }
}
