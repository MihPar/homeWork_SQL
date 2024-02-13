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
export class IsExistEmailUser implements CanActivate {
  constructor(private readonly usersQueryRepository: UsersQueryRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const email = req.body.email;
    const user: UserClass| null =
      await this.usersQueryRepository.findByLoginOrEmail(email);
    if (!user) {
      throw new BadRequestException([
        { message: 'User does not exist in DB', field: 'email' }, 
      ]);
    } else if(user.isConfirmed === true) {
		throw new BadRequestException([
			{ message: 'Email is already exist in DB', field: 'email' },
		  ]);
	}
    return true;
  }
}
