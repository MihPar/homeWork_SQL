import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { DeviceQueryRepository } from '../deviceQuery.repository';

@Injectable()
export class ForbiddenCalss implements CanActivate {
  constructor(protected deviceQueryRepository: DeviceQueryRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const deviceId = req.params.deviceId;
	// console.log("deviceId: ", deviceId)
    if (!deviceId) throw new NotFoundException('404');
    const findSession = await this.deviceQueryRepository.findDeviceByDeviceId(
      deviceId,
    );
    if (!findSession) throw new NotFoundException('404');
    if (!req['user']) throw new UnauthorizedException('401');
    const userId = req.user!.id.toString();
    if (findSession.userId !== userId) throw new ForbiddenException('403');
    return true;
  }
}
