import { Injectable } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { ConfigType } from "./configServiceType";


@Injectable()
export class ApiConfigService {
 constructor(
	private configService: ConfigService<ConfigType>
 ) {}

 get JWT_SECRET(): string | undefined {
	return this.configService.get("JWT_SECRET", {infer: true})
 }

 get EXPIRED_JWT(): string | undefined {
	return this.configService.get("EXPIRED_JWT", {infer: true})
 }

 get REFRESH_JWT_SECRET(): string | undefined {
	return this.configService.get("REFRESH_JWT_SECRET", {infer: true})
 }

 get EXPIRED_REFRESH_JWT(): string |undefined {
	return this.configService.get("EXPIRED_REFRESH", {infer: true})
 }
}