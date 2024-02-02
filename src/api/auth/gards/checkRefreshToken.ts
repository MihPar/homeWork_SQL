import dotenv from 'dotenv';
dotenv.config();
import { JwtService } from '@nestjs/jwt';
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { UsersQueryRepository } from '../../../api/users/users.queryRepository';

@Injectable()
export class CheckRefreshToken implements CanActivate {
	constructor(
		protected jwtService: JwtService,
		protected deviceQueryRepository: DeviceQueryRepository,
		protected usersQueryRepository: UsersQueryRepository,
		protected apiJwtService: ApiJwtService
	) {}
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean>  {
	const req: Request = context.switchToHttp().getRequest();
	const refreshToken = req.cookies.refreshToken;
	// console.log("refreshToken: ", refreshToken)
	if (!refreshToken) throw new UnauthorizedException("401")

	let result: any;
	// console.log("result: ", result)
	try {
		result = await this.jwtService.verify(refreshToken, {secret: process.env.REFRESH_JWT_SECRET!});
		// result = await jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET!);
	} catch (err) { 
		throw new UnauthorizedException("401")
	}
	console.log("result: ", result)
	const session = await this.deviceQueryRepository.findDeviceByDeviceId(
	  result.deviceId
	);
	const payload = await this.jwtService.decode(refreshToken);

	const oldActiveDate = new Date(payload.iat * 1000).toISOString()
	if (
	  !session ||
	  session!.lastActiveDate !== oldActiveDate
		// (await this.apiJwtService.getLastActiveDate(refreshToken))
	) {
		throw new UnauthorizedException("401")
	}

	if (result.userId) {
	  const user = await this.usersQueryRepository.findUserById(result.userId)
	  if (!user) {
		throw new UnauthorizedException("401")
	  }
	//   console.log("user: ", user)
	  req['user'] = user;
	  return true
	}
	throw new UnauthorizedException("401")
  }
}