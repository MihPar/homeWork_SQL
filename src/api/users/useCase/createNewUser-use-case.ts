import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserViewType } from '../user.type';
import { InputModelClassCreateBody, UserClass } from '../user.class';
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { UsersRepository } from '../users.repository';
import { GenerateHashAdapter } from '../../auth/adapter/generateHashAdapter';
import { EmailManager } from '../../../infrastructura/email/email.manager';

export class CreateNewUserCommand {
  constructor(public body: InputModelClassCreateBody) {}
}

@CommandHandler(CreateNewUserCommand)
export class CreateNewUserUseCase implements ICommandHandler<CreateNewUserCommand> {
  constructor(
    protected readonly generateHashAdapter: GenerateHashAdapter,
    protected readonly usersRepository: UsersRepository,
    protected readonly emailManager: EmailManager,
  ) {}
  async execute(command: CreateNewUserCommand): Promise<UserViewType | null> {
    const passwordHash = await this.generateHashAdapter._generateHash(
      command.body.password
    );
    const newUser = new UserClass(
      command.body.login,
      command.body.email,
      passwordHash,
      new Date().toISOString(),
	  uuidv4(),
      add(new Date(), { hours: 1, minutes: 10 }).toISOString(),
    );
    // newUser.userName = command.body.login,
    // newUser.email = command.body.email,
    // newUser.passwordHash = passwordHash,
    // newUser.createdAt = new Date().toISOString()
    // newUser.confirmationCode = uuidv4(),
    newUser.expirationDate = add(new Date(), {
      hours: 1,
      minutes: 10,
    }).toISOString();
    newUser.isConfirmed = false;
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
