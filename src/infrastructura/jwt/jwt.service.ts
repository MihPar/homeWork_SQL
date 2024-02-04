import jwt  from 'jsonwebtoken';
import { Injectable } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { ApiConfigService } from '../config/configService';

@Injectable()
export class ApiJwtService {
	constructor(
		private jwtService: JwtService,
		private apiConfigService: ApiConfigService,
	) {}

	async createJWT(userId: string, deviceId: string): Promise<any> {

		const secretJwt = this.apiConfigService.JWT_SECRET
		const expiredJwt = this.apiConfigService.EXPIRED_JWT
		const accessToken = this.jwtService.sign({userId}, {secret: secretJwt, expiresIn: expiredJwt})


		const secretRT = this.apiConfigService.REFRESH_JWT_SECRET
		const expiresInRT = this.apiConfigService.EXPIRED_REFRESH_JWT
		const refreshToken = this.jwtService.sign({userId, deviceId}, {secret: secretRT, expiresIn: expiresInRT})

		return {
			accessToken,
			refreshToken
		}
	}

	async refreshToken(refreshToken: string):Promise<any> {
		try {
			const secretRT = this.apiConfigService.REFRESH_JWT_SECRET
			return this.jwtService.verify(refreshToken, {secret: secretRT})
		} catch(error) {
			return null
		}
	}

	getLastActiveDate(token: string): Date {
		const result: any = jwt.decode(token)
		return new Date(result.iat * 1000)
	}

	getDeviceIdByToken(token: string) {
        try {
            const result: any = jwt.verify(token, process.env.REFRESH_JWT_SECRET!)
            return result //==={userId: user._id, deviceId: deviceId}

        } catch (error) {
            return null
        }
    }
}