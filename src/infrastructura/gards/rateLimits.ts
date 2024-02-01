import dotenv from 'dotenv';
dotenv.config();
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { Request } from 'express';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class Ratelimits implements CanActivate {
  constructor(
    protected userService: UsersService,
    @InjectDataSource() protected dataSource: DataSource
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    console.log(req.headers.authorization);
    console.log(this.userService);
    const reqData: IPCollectionClass = {
      _id: new ObjectId(),
      IP: req.ip || '',
      URL: req.originalUrl,
      date: new Date(),
    };
    await this.ipCollectionModel.create(reqData);
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
