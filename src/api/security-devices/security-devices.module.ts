import { Module } from '@nestjs/common';
import { SecurityDevicesController } from './security-devices.controller';

@Module({
  controllers: [SecurityDevicesController],
//   providers: [SecurityDevicesService],
})
export class SecurityDevicesModule {}
