import { Controller, Delete, Get, HttpCode, NotFoundException, Param, Req, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { DeviceQueryRepository } from "./deviceQuery.repository";
import { DeviceRepository } from './device.repository';
import { Request } from "express";
import { CommandBus } from "@nestjs/cqrs";
import { PayloadAdapter } from "../auth/adapter/payload.adapter";
import { CheckRefreshToken } from "../auth/gards/checkRefreshToken";
import { UserDecorator, UserIdDecorator } from "src/infrastructura/decorators/decorator.user";
import { UserClass } from "../users/user.class";
import { TerminateAllCurrentSessionCommand } from "./useCase/terminateAllCurrentSeccion-use-case";
import { ForbiddenCalss } from "./gards/forbidden";

@Controller('security/devices')
export class SecurityDeviceController {
  constructor(
    protected deviceQueryRepository: DeviceQueryRepository,
    protected deviceRepository: DeviceRepository,
	protected commandBus: CommandBus,
	protected payloadAdapter: PayloadAdapter
  ) {}
  
  @Get('')
  @HttpCode(200)
  @UseGuards(CheckRefreshToken)
  async getDevicesUser(
    @UserDecorator() user: UserClass,
    @UserIdDecorator() userId: string | null,
  ) {
    if (!userId) return null;
    return await this.deviceQueryRepository.getAllDevicesUser(userId);
  }

  @Delete('')
  @UseGuards(CheckRefreshToken)
  @HttpCode(204)
  async terminateCurrentSession(
    @UserDecorator() user: UserClass,
    @UserIdDecorator() userId: string | null,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    if (!userId) return null;
    const refreshToken = req.cookies.refreshToken;
    const payload = await this.payloadAdapter.getPayload(refreshToken);
    if (!payload) throw new UnauthorizedException('401');
	const command = new TerminateAllCurrentSessionCommand(userId, payload.deviceId)
	  const findAllCurrentDevices =
      await this.commandBus.execute(command)
    if (!findAllCurrentDevices) throw new UnauthorizedException('401');
  }

  @Delete(':deviceId')
  @HttpCode(204)
  @UseGuards(CheckRefreshToken, ForbiddenCalss)
//   @UseGuards(ForbiddenCalss)
  async terminateSessionById(@Param('deviceId') deviceId: string) {
	const deleteDeviceById = await this.deviceRepository.terminateSession(deviceId);
	if (!deleteDeviceById) throw new NotFoundException("404")
	return
  }
}