import dotenv from 'dotenv';
dotenv.config();
import {
	Injectable,
	CanActivate,
	ExecutionContext,
	BadRequestException,
  } from '@nestjs/common';
  import { UsersQueryRepository } from '../../../api/users/users.queryRepository';
import { UserClass } from 'src/api/users/user.class';
  
  @Injectable()
  export class IsConfirmed implements CanActivate {
	constructor(private readonly usersQueryRepository: UsersQueryRepository) {}
  
	async canActivate(context: ExecutionContext): Promise<boolean> {
	  const req = context.switchToHttp().getRequest();
	  const code = req.body.code;
  
	  const user: UserClass | null = await this.usersQueryRepository.findUserByConfirmation(code)
	console.log(user)
	if(!user) {
		throw new BadRequestException([{message: 'Incorrect code!', field: 'code'}])
	} 
    if(user.emailConfirmation.expirationDate <= new Date()) {
		throw new BadRequestException([{message: 'Incorrect code!', field: 'code'}])
	} 
	if(user.emailConfirmation.isConfirmed) {
		throw new BadRequestException([{message: 'Incorrect code!', field: 'code'}])
	}
	req.user = user
	return true
	}
  }
  