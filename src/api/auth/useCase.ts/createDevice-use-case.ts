import { JwtService } from '@nestjs/jwt';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { randomUUID } from 'crypto';
import { UserClass } from '../../users/user.class';
import { DeviceRepository } from '../../security-devices/device.repository';
import { ApiJwtService } from '../../../infrastructura/jwt/jwt.service';
import { DeviceClass } from '../../security-devices/dto/device.class';

export class CreateDeviceCommand {
	constructor(
		public IP: string, 
		public deviceName: string,
		public user: UserClass,
	) {}
}

@CommandHandler(CreateDeviceCommand)
export class CreateDeviceUseCase implements ICommandHandler<CreateDeviceCommand> {
	constructor(
		protected readonly deviceRepository: DeviceRepository,
		protected readonly jwtService: JwtService,
		protected readonly apiJwtService: ApiJwtService,

	) {}
	async execute(
		command: CreateDeviceCommand
	  ): Promise<{refreshToken: string, token: string} | null> {
		try {
			const deviceId = randomUUID()
			const {accessToken, refreshToken} = await this.apiJwtService.createJWT(command.user.id.toString(), deviceId)
			const payload = await this.jwtService.decode(refreshToken);
			const date = payload.iat * 1000
			const ip = command.IP || "unknown";
			// const title = command.Headers["user-agent"] || "unknown";
	
			const device  = new DeviceClass()
			device.ip = ip
			device.deviceId = deviceId
			device.lastActiveDate = new Date(date).toISOString()
			device.title = command.deviceName
			device.userId = command.user.id.toString()
			
			const createdDeviceId: string | null = await this.deviceRepository.createDevice(device);
	
			if(!createdDeviceId){
				return null
			}
			return {
				refreshToken,
				token: accessToken
			};
		} catch(error) {
			console.log("WIOERUWEFJSDKFJSDFSDIFSFISFISEISEF: ", error)
		}
		return null
	  }
}