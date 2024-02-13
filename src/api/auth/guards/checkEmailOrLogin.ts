import dotenv from 'dotenv';
dotenv.config();
import {
	Injectable,
	CanActivate,
	ExecutionContext,
	BadRequestException,
  } from '@nestjs/common';
import { UsersQueryRepository } from '../../users/users.queryRepository';
import { UserClass } from '../../users/user.class';

  
  @Injectable()
  export class CheckLoginOrEmail implements CanActivate {
    constructor(
		private readonly usersQueryRepository: UsersQueryRepository,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest()
		const login = req.body.login
		const email = req.body.email
		const userByLoginOrEmail: UserClass | null = await this.usersQueryRepository.findByLoginOrEmail(login)
		// const userByLogin: UserClass | null = await this.usersQueryRepository.findByLoginOrEmail(login)
		// const userByEmail: UserClass | null = await this.usersQueryRepository.findByLoginOrEmail(email)

		if(userByLoginOrEmail) {
			throw new BadRequestException([{message: 'Incorrect login!', field: 'login'}])
		}

		if(userByLoginOrEmail){
			throw new BadRequestException([{message: 'Incorrect email!', field: 'email'}])
		}

		return true
  	}
}