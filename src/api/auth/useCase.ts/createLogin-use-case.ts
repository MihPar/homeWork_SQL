import bcrypt  from 'bcrypt';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UsersQueryRepository } from "../../../api/users/users.queryRepository";
import { InputDataModelClassAuth } from '../dto/auth.class.pipe';
import { UserClass } from '../../users/user.class';
import { v4 as uuidv4 } from 'uuid'; 

export class CreateLoginCommand {
	constructor(
		public inutDataModel: InputDataModelClassAuth,
	) {}
}

@CommandHandler(CreateLoginCommand)
export class CreateLoginUseCase implements ICommandHandler<CreateLoginCommand> {
  constructor(protected readonly usersQueryRepository: UsersQueryRepository) {}
  async execute(command: CreateLoginCommand): Promise<UserClass | null> {
    try {
      const user: UserClass | null =
        await this.usersQueryRepository.findByLoginOrEmail(
          command.inutDataModel.loginOrEmail
        );

		// const mappingData = getViewUser(user.Id, user.Login, user.Email, user.CreatedAt)

	  		console.log("user: ", user)
			console.log("user?.passwordHash: ", user!.passwordHash)
			console.log("user?.userName: ", user!.userName)
		// user!.passwordHash = uuidv4()
		// console.log("command.inutDataModel.password,: ", command.inutDataModel.password,)
      if (!user) return null;
      const resultBcryptCompare: boolean = await bcrypt.compare(
        command.inutDataModel.password, user!.passwordHash
		);
      console.log("resultBcryptCompare: ", resultBcryptCompare);
      if (resultBcryptCompare !== true) return null;
      return user;
    } catch (error) {
      console.log("EWUIWERUWEIRWEURIWEURWEIRUWERIWEUEWIRUERIWURWEIRU: ", error);
    }
    return null;
  }
}


