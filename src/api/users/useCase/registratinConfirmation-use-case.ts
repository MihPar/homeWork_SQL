import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../users.queryRepository';
import { InputDateReqConfirmClass } from 'src/api/auth/dto/auth.class.pipe';
import { UsersRepository } from '../users.repository';

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
    const result = await this.usersRepository.updateConfirmation(user!.id);
    return result;
  }
}
