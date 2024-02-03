import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthBasic implements CanActivate {
  constructor() {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const expectAuthHead = 'admin:qwerty';
      const encoding = Buffer.from(expectAuthHead).toString('base64');
      const req: Request = context.switchToHttp().getRequest();
      const auth = req.headers.authorization;
      if (!auth) throw new UnauthorizedException('401');
      const [key, value] = auth.split(' ');
      if (key !== 'Basic') throw new UnauthorizedException('401');
      if (value !== encoding) throw new UnauthorizedException('401');
      return true;
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException('401');
    }
  }
}
