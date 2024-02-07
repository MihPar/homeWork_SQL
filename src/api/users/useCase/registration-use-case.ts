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
export class RegistrationUseCase implements ICommandHandler<RegistrationCommand> {
  constructor(
    protected readonly usersRepository: UsersRepository,
    protected readonly emailManager: EmailManager,
	protected readonly generateHashAdapter: GenerateHashAdapter,
	protected readonly usersQueryRepository: UsersQueryRepository
  ) {}
  async execute(command: RegistrationCommand): Promise<UserViewType | null> {

	// const findUserByEmail = await this.usersQueryRepository.findByLoginOrEmail(command.inputDataReq.email)
	// const findUserByLogin = await this.usersQueryRepository.findByLoginOrEmail(command.inputDataReq.login)

	// if(findUserByEmail || findUserByLogin) return null

    const passwordHash = await this.generateHashAdapter._generateHash(
      command.inputDataReq.password,
    );
	
    const newUser = new UserClass()
	//newUser.id = uuidv4()
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

	

    const userId: string = await this.usersRepository.createUser(newUser);
	console.log("userId: ", userId)
    try {
      await this.emailManager.sendEamilConfirmationMessage(
        newUser.email,
        newUser.confirmationCode,
      );
    } catch (error) {
      console.log(error, 'error with send mail');
    }
	console.log("newUser: ", newUser)
	newUser.id = userId
    return newUser.getViewUser();
  }
}
