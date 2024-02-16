import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserViewType } from '../user.type';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { UsersRepository } from '../users.repository';
import { UserClass } from '../user.class';
import { InputDataReqClass } from '../../auth/dto/auth.class.pipe';
import { EmailManager } from '../../../infrastructura/email/email.manager';
import { GenerateHashAdapter } from '../../auth/adapter/generateHashAdapter';
import { UsersQueryRepository } from '../users.queryRepository';

export class RegistrationCommand {
  constructor(public inputDataReq: InputDataReqClass) {}
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase
  implements ICommandHandler<RegistrationCommand>
{
  constructor(
    protected readonly usersRepository: UsersRepository,
    protected readonly emailManager: EmailManager,
    protected readonly generateHashAdapter: GenerateHashAdapter,
    protected readonly usersQueryRepository: UsersQueryRepository
  ) {}
  async execute(command: RegistrationCommand) {
    const passwordHash = await this.generateHashAdapter._generateHash(
      command.inputDataReq.password
    );
    const newUser = new UserClass(
      command.inputDataReq.login,
      command.inputDataReq.email,
      passwordHash,
	  new Date().toISOString(),
      uuidv4(),
      add(new Date(), {
        hours: 1,
        minutes: 10,
      }).toISOString()
    );
    const userId: string = await this.usersRepository.createUser(newUser);
    try {
      await this.emailManager.sendEamilConfirmationMessage(
        newUser.email,
        newUser.confirmationCode
      );
    } catch (error) {
      console.log(error, "error with send mail");
    }
    newUser.id = userId;
    return newUser.getViewUser();
  }
}
