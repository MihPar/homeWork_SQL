import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SecurityDevicesModule } from './security-devices/security-devices.module';
import { ConfigModule } from '@nestjs/config';

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
})
export class AppModule {}
