import dotenv from 'dotenv';
import { JwtService } from '@nestjs/jwt';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersQueryRepository } from '../../users/users.queryRepository';
dotenv.config();

@Injectable()
export class CheckRefreshTokenForComments implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
	const req: Request = context.switchToHttp().getRequest();
    if (!req.headers.authorization) throw new UnauthorizedException("401")
    const token = req.headers.authorization.split(' ')[1];
	let userId: string
	try {
		userId = (await this.jwtService.verifyAsync(token, {secret: process.env.JWT_SECRET!})).userId
	} catch(error) {
		throw new UnauthorizedException("401")
	}
    if (userId) {
      const user = await this.usersQueryRepository.findUserById(userId);
      if (user) {
        req['user'] = user;
        return true
      }
      throw new UnauthorizedException("401")
    } else {
      throw new UnauthorizedException("401")
    }
  }
}
