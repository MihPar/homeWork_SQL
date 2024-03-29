import { BadRequestException, Body, Controller, Get, Headers, HttpCode, HttpException, Ip, Post, Req, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { AuthRepository } from "./auth.repository";
import { InputDataModelClassAuth, InputDataReqClass, InputDateReqConfirmClass, InputModelNewPasswordClass, emailInputDataClass } from "./dto/auth.class.pipe";
import { RecoveryPasswordCommand } from "./useCase.ts/recoveryPassowrdUseCase";
import { NewPasswordCommand } from "./useCase.ts/createNewPassword-use-case";
import { CreateLoginCommand } from "./useCase.ts/createLogin-use-case";
import { UserClass } from "../users/user.class";
import { CreateDeviceCommand } from "./useCase.ts/createDevice-use-case";
import { CheckRefreshToken } from "./guards/checkRefreshToken";
import { RefreshTokenCommand } from "./useCase.ts/refreshToken-use-case";
import { UpdateDeviceCommand } from "../security-devices/useCase/updateDevice-use-case";
import { IsConfirmed } from "./guards/isCodeConfirmed";
import { RegistrationConfirmationCommand } from "../users/useCase/registratinConfirmation-use-case";
import { CheckLoginOrEmail } from "./guards/checkEmailOrLogin";
import { RegistrationCommand } from "../users/useCase/registration-use-case";
import { IsExistEmailUser } from "./guards/isExixtEmailUser";
import { RegistrationEmailResendingCommand } from "../users/useCase/registrationEmailResending-use-case";
import { LogoutCommand } from "../security-devices/useCase/logout-use-case";
import { CheckRefreshTokenForComments } from "../comment/use-case/bearer.authForComments";
import { GetUserIdByTokenCommand } from "./useCase.ts/getUserIdByToken-use-case";
import { UsersQueryRepository } from "../users/users.queryRepository";
import { UserDecorator, UserIdDecorator } from "../../infrastructura/decorators/decorator.user";
import { Ratelimits } from "./guards/rateLimits";
import { SkipThrottle, Throttle, ThrottlerGuard } from '@nestjs/throttler';


// @UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
	constructor(
		protected commandBus: CommandBus,
		protected jwtService: JwtService,
		protected usersQueryRepository: UsersQueryRepository,
		protected authRepository: AuthRepository
	) {}

	@HttpCode(204)
	@Post("password-recovery")
	// @UseGuards(Ratelimits)
	async createPasswordRecovery(@Body() emailInputData: emailInputDataClass) {
		const command = new RecoveryPasswordCommand(emailInputData.email)
		const passwordRecovery = await this.commandBus.execute(command)
	}

	@HttpCode(204)
	@Post("new-password")
	// @UseGuards(Ratelimits)
	async createNewPassword(@Body() inputDataNewPassword: InputModelNewPasswordClass) {
		const command = new NewPasswordCommand(inputDataNewPassword)
		const resultUpdatePassword = await this.commandBus.execute(command)
		  if (!resultUpdatePassword) throw new BadRequestException("recovery code is incorrect, 400")
	}

	@HttpCode(200)
	@Post('login')
	// @UseGuards(Ratelimits)
	async createLogin(
		@Body() inutDataModel: InputDataModelClassAuth,
		@Ip() IP: string, 
		@Headers("user-agent") deviceName = "unknown",
		@Res({passthrough: true}) res: Response) {
		const command = new CreateLoginCommand(inutDataModel)
		const user: UserClass | null = await this.commandBus.execute(command);
		  if (!user) {
			throw new UnauthorizedException("Not authorization 401")
		  } else {
			const command = new CreateDeviceCommand(IP, deviceName, user)
			const tokens = await this.commandBus.execute(command)
			if(!tokens){
				throw new HttpException("Errror", 500)
			}
			res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: true,
            });
            return {accessToken: tokens.token};
		  }
	}
	
	@HttpCode(200)
	@Post("refresh-token")
	// @SkipThrottle({default: true})
	@UseGuards(CheckRefreshToken)
	async cretaeRefreshToken(
		@Req() req: Request,
		@Res({passthrough: true}) res: Response,
		@UserDecorator() user: UserClass,
		@UserIdDecorator() userId: string | null,
	) {
		const refreshToken: string = req.cookies.refreshToken;
		const command = new RefreshTokenCommand(refreshToken, user)
		const result: { newToken: string, newRefreshToken: string} = await this.commandBus.execute(command)
		if(!userId) return null
		const command2 = new UpdateDeviceCommand(userId, result.newRefreshToken)
		await this.commandBus.execute(command2)
		res.cookie('refreshToken', result.newRefreshToken, {
			httpOnly: true,
			secure: true,
		});
		return {accessToken: result.newToken};
		}

	@HttpCode(204)
	@Post("registration-confirmation")
	// @UseGuards(Ratelimits)
	async createRegistrationConfirmation(@Body() inputDateRegConfirm: InputDateReqConfirmClass) {
		const command = new RegistrationConfirmationCommand(inputDateRegConfirm)
		const registrationConfirmation =  await this.commandBus.execute(command)
		if(!registrationConfirmation) throw new BadRequestException([{ message: "bed request", field: "code" }])
	}

	@Post("registration")
	@HttpCode(204)
	// @UseGuards(Ratelimits)
	@UseGuards(CheckLoginOrEmail)
	async creteRegistration(@Req() req: Request, @Body() inputDataReq: InputDataReqClass) {
		const command = new RegistrationCommand(inputDataReq)
		const user = await this.commandBus.execute(command)
		  if (!user) throw new BadRequestException("400")
		  return
	}

	@HttpCode(204)
	@Post("registration-email-resending")
	// @UseGuards(Ratelimits)
	@UseGuards(IsExistEmailUser)
	async createRegistrationEmailResending(@Req() req: Request, @Body() inputDateReqEmailResending: emailInputDataClass) {
		const command = new RegistrationEmailResendingCommand(inputDateReqEmailResending)
		const confirmUser = await this.commandBus.execute(command)
		  if (!confirmUser) throw new BadRequestException("400")
		  return true
	}

	@HttpCode(204)
	@Post("logout")
	// @SkipThrottle({default: true})
	@UseGuards(CheckRefreshToken)
	async cretaeLogout(@Req() req: Request) {
		const refreshToken: string = req.cookies.refreshToken;
		const command = new LogoutCommand(refreshToken)
		const isDeleteDevice = await this.commandBus.execute(command)
		if (!isDeleteDevice) throw new UnauthorizedException('Not authorization 401')
	}

	@HttpCode(200)
	@Get("me")
	// @SkipThrottle({default: true})
	@UseGuards(CheckRefreshTokenForComments)
	async findMe(@Req() req: Request) {
		if (!req.headers.authorization) throw new UnauthorizedException('Not authorization 401')
		const command = new GetUserIdByTokenCommand(req)
		const findUserById: UserClass = await this.commandBus.execute(command)
		  return {
			userId: findUserById.id.toString(),
			email: findUserById.email,
			login: findUserById.userName,
		  }
	}
}
