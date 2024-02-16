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
  export class IsConfirmed implements CanActivate {
	constructor(private readonly usersQueryRepository: UsersQueryRepository) {}
  
	async canActivate(context: ExecutionContext): Promise<boolean> {
	  const req = context.switchToHttp().getRequest();
	  const code = req.body.code;
	const user: UserClass | null = await this.usersQueryRepository.findUserByConfirmation(code)
	
	if(!user) {
		throw new BadRequestException([{message: 'Incorrect code!', field: 'code'}])
	} 
    if(new Date(user.expirationDate) <= new Date()) {
		throw new BadRequestException([{message: 'Incorrect code!', field: 'code'}])
	} 
	if(user.isConfirmed) {
		throw new BadRequestException([{message: 'Incorrect code!', field: 'code'}])
	}
	req.user = user
	return true
	}
  }
  