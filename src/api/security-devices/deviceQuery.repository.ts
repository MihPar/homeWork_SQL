import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { DeviceClass } from "./dto/device.class";

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
		const getDevice = await this.dataSource.query(query, [userId])[0]
		return getDevice
	}

	async findDeviceByDeviceId(deviceId: string) {
		const query = `
			SELECT *
				FROM public."Devices"
				WHERE "deviceId" = $1
	`
		const deviceByDeviceId = await this.dataSource.query(query, [deviceId])
		return deviceByDeviceId.map(function(item) {
			return {
				ip: item.ip,
				title: item.title,
				deviceId: item.deviceId,
				userId: item.userId,
				lastActiveDate: item.lastActiveDate
			}
		})
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
			ip: item.IP,
			title: item.Title,
			lastActiveDate: item.LastActiveDate,
			deviceId: item.DeviceId,
		  };
		});
	}
}