import dotenv from 'dotenv';
dotenv.config();
import { JwtService } from '@nestjs/jwt';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersQueryRepository } from '../../../api/users/users.queryRepository';

@Injectable()
export class CheckRefreshTokenForPost implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
	const req: Request = context.switchToHttp().getRequest();
    if (!req.headers.authorization) throw new UnauthorizedException("401")
    const token = req.headers.authorization.split(' ')[1];
	let result: any
	try {
		result = await this.jwtService.verifyAsync(token, {secret: process.env.JWT_SECRET!})
	} catch(error) {
		throw new UnauthorizedException("401")
	}
    if (result) {
      const user = await this.usersQueryRepository.findUserById(result.userId);
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
