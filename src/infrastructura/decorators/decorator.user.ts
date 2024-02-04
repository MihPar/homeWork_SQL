import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserClass } from '../../api/users/user.class';

export const UserDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const UserIdDecorator = createParamDecorator(
	(data: unknown, ctx: ExecutionContext) => {
	  const request = ctx.switchToHttp().getRequest();
	  return (request.user as UserClass)?.id ?? null;
	},
  );