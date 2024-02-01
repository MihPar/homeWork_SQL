import dotenv from 'dotenv';
dotenv.config();
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { Request } from 'express';
 import { UsersService } from 'src/api/users/users.service';
import { AuthRepository } from '../auth.repository';
import { IPCollectionClass } from '../entities/auth.class.type';

@Injectable()
export class Ratelimits implements CanActivate {
  constructor(
    protected userService: UsersService,
    protected authRepository: AuthRepository
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

	const objCollection = {
		IP: req.ip || '',
		URL: req.originalUrl,
		date: new Date(),
	}
    
	const reqData: IPCollectionClass = this.authRepository.create(objCollection)

    const tenSecondsAgo = new Date(Date.now() - 10000);
    const filter = {
      $and: [
        { IP: reqData.IP },
        { URL: reqData.URL },
        { date: { $gte: tenSecondsAgo } },
      ],
    };

    const count = await this.ipCollectionModel.countDocuments(filter);
    if (count > 5) {
      throw new HttpException(
        'More than 5 attempts from one IP-address during 10 seconds',
        429,
      );
    }
    return true;
  }
}
