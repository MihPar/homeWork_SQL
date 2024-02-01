import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './api/users/users.module';
import { AuthModule } from './api/auth/auth.module';
import { SecurityDevicesModule } from './api/security-devices/security-devices.module';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './api/auth/auth.controller';
import { SecurityDevicesController } from './api/security-devices/security-devices.controller';
import { UsersController } from './api/users/users.controller';
import { AuthRepository } from './api/auth/auth.repository';
// import { UsersService } from './api/users/users.service';


// const services = [UsersService]
const repositories = [AuthRepository]

@Module({
  imports: [
	ConfigModule.forRoot({
		isGlobal: true,
		envFilePath: '.env',
	  }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
      database: 'BankSystem',
      autoLoadEntities: false,
      synchronize: false,
    }),
    UsersModule,
    AuthModule,
    SecurityDevicesModule,
  ],
  controllers: [AuthController, SecurityDevicesController, UsersController],
  providers: [
	...repositories, 
	// ...services
]
})
export class AppModule {}
