import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './api/users/users.module';
import { AuthModule } from './api/auth/auth.module';
import { SecurityDevicesModule } from './api/security-devices/security-devices.module';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './api/auth/auth.controller';
import { SecurityDevicesController } from './api/security-devices/security-devices.controller';
import { AuthRepository } from './api/auth/auth.repository';
import { RecoveryPasswordUseCase } from './api/auth/useCase.ts/recoveryPassowrdUseCase';
import { NewPasswordUseCase } from './api/auth/useCase.ts/createNewPassword-use-case';
import { CreateLoginUseCase } from './api/auth/useCase.ts/createLogin-use-case';
import { CreateDeviceUseCase } from './api/auth/useCase.ts/createDevice-use-case';
import { RefreshTokenUseCase } from './api/auth/useCase.ts/refreshToken-use-case';
import { UpdateDeviceUseCase } from './api/security-devices/useCase/updateDevice-use-case';
import { RegistrationConfirmationUseCase } from './api/users/useCase/registratinConfirmation-use-case';
import { RegistrationUseCase } from './api/users/useCase/registration-use-case';
import { RegistrationEmailResendingUseCase } from './api/users/useCase/registrationEmailResending-use-case';
import { LogoutUseCase } from './api/security-devices/useCase/logout-use-case';
import { GetUserIdByTokenUseCase } from './api/auth/useCase.ts/getUserIdByToken-use-case';
import { Ratelimits } from './api/auth/gards/rateLimits';
import { CheckRefreshToken } from './api/auth/gards/checkRefreshToken';
import { IsConfirmed } from './api/auth/gards/isCodeConfirmed';
import { CheckLoginOrEmail } from './api/auth/gards/checkEmailOrLogin';
import { IsExistEmailUser } from './api/auth/gards/isExixtEmailUser';
import { CheckRefreshTokenForComments } from './api/comments/bearer.authForComments';
import { DeviceRepository } from './api/security-devices/device.repository';
import { DeviceQueryRepository } from './api/security-devices/deviceQuery.repository';
import { UsersRepository } from './api/users/users.repository';
import { UsersQueryRepository } from './api/users/users.queryRepository';

const userCases = [
  RecoveryPasswordUseCase,
  NewPasswordUseCase,
  CreateLoginUseCase,
  CreateDeviceUseCase,
  RefreshTokenUseCase,
  UpdateDeviceUseCase,
  RegistrationConfirmationUseCase,
  RegistrationUseCase,
  RegistrationEmailResendingUseCase,
  LogoutUseCase,
  GetUserIdByTokenUseCase,
];

const gards = [
  Ratelimits,
  CheckRefreshToken,
  IsConfirmed,
  CheckLoginOrEmail,
  IsExistEmailUser,
  CheckRefreshTokenForComments,
];

const repositories = [AuthRepository, DeviceRepository, DeviceQueryRepository, UsersRepository, UsersQueryRepository];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
      database: "BankSystem",
      autoLoadEntities: false,
      synchronize: false,
    }),
    UsersModule,
    AuthModule,
    SecurityDevicesModule,
  ],
  controllers: [AuthController, SecurityDevicesController],
  providers: [
    ...repositories,
    ...userCases,
	...gards,
	...repositories
  ],
})
export class AppModule {}
