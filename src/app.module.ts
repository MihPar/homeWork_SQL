import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './api/auth/auth.controller';
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
import { DeleteAllDataController } from './api/delete/delete.allData';
import { AuthBasic } from './api/users/gards/basic.auth';
import { UsersController } from './api/users/users.controller';
import { CreateNewUserUseCase } from './api/users/useCase/createNewUser-use-case';
import { DeleteUserByIdUseCase } from './api/users/useCase/deleteUserById-use-case';
import { DeleteAllUsersUseCase } from './api/users/useCase/deleteAllUsers-use-case';
import { EmailManager } from './infrastructura/email/email.manager';
import { GenerateHashAdapter } from './api/auth/adapter/generateHashAdapter';
import { JwtService } from '@nestjs/jwt';
import { ApiJwtService } from './infrastructura/jwt/jwt.service';
import { PayloadAdapter } from './api/auth/adapter/payload.adapter';
import { ApiConfigService } from './infrastructura/config/configService';
import { EmailAdapter } from './infrastructura/email/email.adapter';
import { CqrsModule } from '@nestjs/cqrs';
import { DeleteAllDevicesUseCase } from './api/security-devices/useCase/deleteAllDevices-use-case';
import { SecurityDeviceController } from './api/security-devices/device.controller';
import { TerminateAllCurrentSessionUseCase } from './api/security-devices/useCase/terminateAllCurrentSeccion-use-case';
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
  CreateNewUserUseCase,
  DeleteUserByIdUseCase,
  DeleteAllUsersUseCase,
  DeleteAllDevicesUseCase,
  TerminateAllCurrentSessionUseCase
];

const gards = [
  Ratelimits,
  CheckRefreshToken,
  IsConfirmed,
  CheckLoginOrEmail,
  IsExistEmailUser,
  CheckRefreshTokenForComments,
  AuthBasic
];

const manager = [EmailManager]
const adapter = [GenerateHashAdapter, PayloadAdapter, EmailAdapter]
const services = [JwtService, ApiJwtService]
const configs = [ApiConfigService]

const repositories = [AuthRepository, DeviceRepository, DeviceQueryRepository, UsersRepository, UsersQueryRepository];

@Module({
  imports: [
	CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "ep-weathered-mouse-a5h47925.us-east-2.aws.neon.tech",
      port: 5432,
      username: process.env.NAMENEON,
      password: process.env.PASSWORDNEON,
      database: "neondb",
      autoLoadEntities: false,
      synchronize: true,
	  ssl: true
    }),
	// TypeOrmModule.forRoot({
    //   type: "postgres",
    //   host: "localhost",
    //   port: 5432,
    //   username: process.env.USERNAME,
    //   password: process.env.PASSWORD,
    //   database: "BankSystem",
    //   autoLoadEntities: false,
    //   synchronize: true,
    // }),
  ],
  controllers: [AuthController, DeleteAllDataController, UsersController, SecurityDeviceController],
  providers: [
    ...repositories,
    ...userCases,
	...gards,
	...repositories,
	...manager,
	...adapter,
	...services,
	...configs
  ],
})
export class AppModule {}
