import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@Injectable()
export class DeviceQueryRepository {
	constructor(
		@InjectDataSource() protected dataSource: DataSource
	) {}
	async getDevicesUser(userId: string) {
		const query = `
			SELECT *
				FROM public."Devices"
				WHERE "userId" = $1
	`
		const getDevice = (await this.dataSource.query(query, [userId]))[0]
		return getDevice
	}

	async findDeviceByDeviceId(deviceId: string) {
    const query = `
			SELECT *
				FROM public."Devices"
				WHERE "deviceId" = $1
	`;
    const deviceByDeviceId = (
      await this.dataSource.query(query, [deviceId])
    )[0];
    return deviceByDeviceId ? {
      ip: deviceByDeviceId.ip,
      title: deviceByDeviceId.title,
      deviceId: deviceByDeviceId.deviceId,
      userId: deviceByDeviceId.userId,
      lastActiveDate: deviceByDeviceId.lastActiveDate,
    } : null
  }

	async getAllDevicesUser(userId: string) {
		const query = `
			SELECT *
				FROM public."Devices"
				where "userId" = $1
	`
		const getAllDevices = await this.dataSource.query(query, [userId])
		return getAllDevices.map(function (item) {
		  return {
			ip: item.ip,
			title: item.title,
			lastActiveDate: item.lastActiveDate,
			deviceId: item.deviceId,
		  };
		});
	}
}