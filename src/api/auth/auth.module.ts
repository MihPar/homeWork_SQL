import { Module } from '@nestjs/common';
// import { AuthService } from './auth.repository';
import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
//   providers: [AuthService],
})
export class AuthModule {}
