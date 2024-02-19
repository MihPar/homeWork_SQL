import dotenv from 'dotenv';
dotenv.config();
import { JwtService } from '@nestjs/jwt';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersQueryRepository } from '../../../api/users/users.queryRepository';

@Injectable()
export class CheckRefreshTokenForGet implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    protected usersQueryRepository: UsersQueryRepository,
    
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
	let token
	let payload
	// console.log("req.headers.authorization", req.headers.authorization)
	if (!req.headers.authorization) {
		req.user = null
	} else {
		token = req.headers.authorization.split(' ')[1];
		try {
			payload = await this.jwtService.verifyAsync(token, {secret: process.env.JWT_SECRET!})
		} catch(err) {
			payload = null
		}
	}
	// console.log("payload:", payload)

    if (payload) {
      const resultAuth = await this.usersQueryRepository.findUserById(payload.userId);
      if (resultAuth) {
        req['user'] = resultAuth;
        return true;
      }
	  
      return false;
    } else {
      return true;
    }
  }
}