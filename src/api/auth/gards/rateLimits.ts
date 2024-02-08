import dotenv from 'dotenv';
dotenv.config();
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthRepository } from '../auth.repository';
import { CollectionIP } from '../../CollectionIP/collection.class';

@Injectable()
export class Ratelimits implements CanActivate {
  constructor(
    protected authRepository: AuthRepository
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

	const objCollection = {
		ip: req.ip || '',
		url: req.originalUrl,
		// date: new Date(),
	}
    
	const reqData: any = this.authRepository.create(objCollection)

    const count = await  this.authRepository.getCount(objCollection);
    if (count > 5) {
      throw new HttpException(
        'More than 5 attempts from one IP-address during 10 seconds',
        429,
      );
    }
    return true;
  }
}
