import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserViewType } from '../user.type';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { UsersRepository } from '../users.repository';
import { UserClass } from '../user.class';
import { InputDataReqClass } from '../../auth/dto/auth.class.pipe';
import { EmailManager } from '../../../infrastructura/email/email.manager';
import { GenerateHashAdapter } from '../../auth/adapter/generateHashAdapter';

export class RegistrationCommand {
  constructor(public inputDataReq: InputDataReqClass) {}
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase implements ICommandHandler<RegistrationCommand> {
  constructor(
    protected readonly usersRepository: UsersRepository,
    protected readonly emailManager: EmailManager,
	protected readonly generateHashAdapter: GenerateHashAdapter
  ) {}
  async execute(command: RegistrationCommand): Promise<UserViewType | null> {
    const passwordHash = await this.generateHashAdapter._generateHash(
      command.inputDataReq.password,
    );
    const newUser = new UserClass()
	newUser.id = uuidv4()
	newUser.userName = command.inputDataReq.login
	newUser.email = command.inputDataReq.email
	newUser.passwordHash = passwordHash
	newUser.confirmationCode = uuidv4()
	newUser.expirationDate = add(new Date(), {
        hours: 1,
        minutes: 10,
      }).toISOString()
	newUser.isConfirmed = false
	newUser.createdAt = new Date().toISOString()

    const user: UserClass = await this.usersRepository.createUser(newUser);
    try {
      await this.emailManager.sendEamilConfirmationMessage(
        user.email,
        user.confirmationCode,
      );
    } catch (error) {
      console.log(error, 'error with send mail');
    }
    return user.getViewUser();
  }
}
