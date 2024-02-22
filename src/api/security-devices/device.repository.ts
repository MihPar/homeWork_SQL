import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DeviceClass } from './dto/device.class';

@Injectable()
export class DeviceRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async terminateSession(deviceId: string) {
    const query = `
		DELETE FROM public."Devices"
			WHERE "deviceId" = $1
`;
    const deletedOne = (await this.dataSource.query(query, [deviceId]))[0]
    if (!deletedOne) return false;
    return true;
  }

  async deleteAllDevices() {
    const deletedAll = await this.dataSource.query(`
		DELETE FROM public."Devices"
	`);
    return true;
  }

  async createDevice(device: DeviceClass): Promise<string | null> {
    try {
      const createDevice: DeviceClass = await this.dataSource.query(`
			INSERT INTO public."Devices"(
				"ip", "title", "deviceId", "userId", "lastActiveDate")
				VALUES (
					'${device.ip}', '${device.title}', '${device.deviceId}', 
					'${device.userId}', '${device.lastActiveDate}')
		`);

      const query = `
			select *
				from public."Devices"
				where "deviceId" = $1
	`;
      const select = await this.dataSource.query(query, [device.deviceId]);
      return select;
    } catch (error) {
      console.log(error, "error in create device");
      return null;
    }
  }

  async updateDeviceUser(
    userId: string,
    deviceId: string,
    newLastActiveDate: string
  ) {
    const query = `
		UPDATE public."Devices"
			SET "lastActiveDate" = $1
			WHERE "deviceId" = $2 AND "userId" = $3
`;
    await this.dataSource.query(query, [
      newLastActiveDate,
      deviceId,
      userId,
    ]);
  }

  async logoutDevice(deviceId: string): Promise<boolean> {
	const query = `
		DELETE FROM public."Devices"
			WHERE "deviceId" = $1
`
    const decayResult = await this.dataSource.query(query, [deviceId]);
    if (!decayResult) return false;
    return true;
  }
}
