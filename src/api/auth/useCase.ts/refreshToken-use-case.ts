import { UnauthorizedException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { PayloadAdapter } from "../adapter/payload.adapter";
import { UserClass } from "../../users/user.class";
import { ApiJwtService } from "../../../infrastructura/jwt/jwt.service";

export class RefreshTokenCommand {
  constructor(
    public refreshToken: string,
    public user: UserClass
  ) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    protected readonly jwtService: JwtService,
    protected readonly payloadAdapter: PayloadAdapter,
    protected readonly apiJwtService: ApiJwtService
  ) {}
  async execute(command: RefreshTokenCommand) {
    const payload = await this.payloadAdapter.getPayload(command.refreshToken);
    if (!payload) throw new UnauthorizedException("Not authorization 401");
    const { accessToken: newToken, refreshToken: newRefreshToken } =
      await this.apiJwtService.createJWT(
        command.user.id.toString(),
        payload.deviceId
      );

    const result = { newToken, newRefreshToken };
    return result;
  }
}
