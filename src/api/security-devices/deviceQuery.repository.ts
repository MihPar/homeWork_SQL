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
				WHERE d."UserId" = '${userId}'
		`)
		return getDevice
	}

	async findDeviceByDeviceId(deviceId: string) {
		return await this.dataSource.query(`
			SELECT d.*
				FROM public."Devices" as d
				WHERE d."DeviceId" = '${deviceId}'
		`)
	  }

	async getAllDevicesUser(userId: string) {
		const getAllDevices = await this.dataSource.query(`
			SELECT "IP", "Title", "DeviceId", "UserId", "LastActiveDate"
				FROM public."Devices" as d
				where d."UserId" = '${userId}'
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