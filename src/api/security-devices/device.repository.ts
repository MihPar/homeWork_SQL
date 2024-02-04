import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DeviceClass } from './dto/device.class';
import { CollectionIP } from '../CollectionIP/collection.class';

@Injectable()
export class DeviceRepository {
	constructor(
		@InjectDataSource() protected dataSource: DataSource 
	) {}

  async terminateSession(deviceId: string) {
    const deletedOne = this.dataSource.query(`
		DELETE FROM public."Devices"
			WHERE "Devices"."Id" = '${deviceId}'
	`);
	if(!deletedOne) return false
	return true
  }


  async deleteAllDevices() {
    const deletedAll = this.dataSource.query(`
		DELETE FROM public."Devices"
	`);
	return true
  }

  async createDevice(device: DeviceClass): Promise<string | null> {
	try {
		const createDevice: DeviceClass = await this.dataSource.query(`
			INSERT INTO public."Devices"(
				"IP", "Title", "DeviceId", "UserId", "LastActiveDate")
				VALUES (
					'${device.ip}', '${device.title}', '${device.deviceId}', 
					'${device.lastActiveDate}', '${device.userId}')
		`)
		return createDevice.deviceId
	} catch(error) {
		console.log(error, 'error in create device')
		return null
	}
  }

  async updateDeviceUser(
    userId: string,
    deviceId: string,
    newLastActiveDate: string
  ) {
	const updateDevice = await this.dataSource.query(`
		UPDATE public."Devices"
			SET "LastActiveDate" = '${newLastActiveDate}'
			WHERE d."DeviceId" = '${deviceId}' AND d."UserId" = '${userId}'
	`)
  }

  async logoutDevice(deviceId: string): Promise<boolean> {
	const decayResult = await this.dataSource.query(`
		DELETE FROM public."Devices" as d
			WHERE d."DeviceId" = '${deviceId}'
	`)
	if(!decayResult) return false
	return true
  }


//   async createCollectionIP(reqData: CollectionIP) {
// 	await this.dataSource.query(`
	
// 	`);
// 	return reqData;
//   }


//   async countDocs(filter: any) {
// 	const result = await this.collectioinIPModel.countDocuments(filter);
// 	return result
//   }
}
