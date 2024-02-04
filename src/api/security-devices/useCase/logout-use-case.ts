import { HttpException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeviceRepository } from "../device.repository";
import { PayloadAdapter } from "../../auth/adapter/payload.adapter";

	export class LogoutCommand {
		constructor(
			public refreshToken: string
		) {}
	}
	
	@CommandHandler(LogoutCommand)
  export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
    constructor(
		protected readonly payloadAdapter: PayloadAdapter ,
		protected readonly deviceRepository: DeviceRepository
	) {}
    async execute(command: LogoutCommand): Promise<boolean> {
      const payload = await this.payloadAdapter.getPayload(command.refreshToken);
      if (!payload) throw new HttpException( 'Can not be payload', 400)
      const logoutDevice = await this.deviceRepository.logoutDevice(
        payload.deviceId,
      );
      if (!logoutDevice) throw new HttpException( 'Can not be logoutDevice', 400)
      return true;
    }
  }