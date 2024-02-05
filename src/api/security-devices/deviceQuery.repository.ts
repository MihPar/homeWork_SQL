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
		const getDevice = await this.dataSource.query(`
			SELECT d.*
				FROM public."Devices" as d
				WHERE d."userId" = '${userId}'
		`)[0]
		return getDevice
	}

	async findDeviceByDeviceId(deviceId: string) {
		const deviceByDeviceId = await this.dataSource.query(`
			SELECT d.*
				FROM public."Devices" as d
				WHERE d."deviceId" = '${deviceId}'
		`)
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
		const getAllDevices = await this.dataSource.query(`
			SELECT "ip", "title", "deviceId", "userId", "lastActiveDate"
				FROM public."Devices" as d
				where d."userId" = '${userId}'
		`)
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