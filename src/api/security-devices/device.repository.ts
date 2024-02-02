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
//   async terminateSession(deviceId: string) {
//     const deletedOne = this.deviceModel.deleteOne({ deviceId });
// 	return deletedOne.deleteOne()
//   }

//   async deleteAllDevices() {
//     const deletedAll = this.deviceModel.deleteMany({});
// 	return deletedAll.deleteMany()
//   }

  async createDevice(device: DeviceClass): Promise<string | null> {
	try {
		const createDevice = await this.dataSource.query(`
			CREATE TABLE Devices (
				IP text,
				Title text,
				DeviceId uuid,
				UserId uuid,
				LastActiveDate date,
				PRIMARY KEY (DeviceId)
			)
		`)
		const updateDevice = await this.dataSource.query(`
			UPDATE public."Devices"
				SET 
					"IP"=device.ip, 
					"Title"=device.title, 
					"DeviceId"=device.deviceId, 
					"UserId"=device.UserId, 
					"LastActiveDate"=device.lastActiveDate
			`)
			const device = await this.dataSource.query(`
				SELECT d.*
					FROM public."Devices" as d
			`)
		return device
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

//   async logoutDevice(deviceId: string) {
// 	const decayResult = await this.deviceModel.deleteOne({deviceId})
// 	return decayResult.deletedCount === 1
//   }

  async createCollectionIP(reqData: CollectionIP) {
	await this.dataSource.query(`
	
	`);
	return reqData;
  }


//   async countDocs(filter: any) {
// 	const result = await this.collectioinIPModel.countDocuments(filter);
// 	return result
//   }
}
