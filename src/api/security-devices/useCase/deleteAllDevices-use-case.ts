import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeviceRepository } from "../device.repository";

export class DeleteAllDevicesCommnad {
	constructor() {}
}

@CommandHandler(DeleteAllDevicesCommnad)
export class DeleteAllDevicesUseCase implements ICommandHandler<DeleteAllDevicesCommnad> {
	constructor(
		protected readonly deviceRepository: DeviceRepository
	) {}
 	async execute(command: DeleteAllDevicesCommnad): Promise<any> {
		return await this.deviceRepository.deleteAllDevices();
	}
}