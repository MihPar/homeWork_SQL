import {
	Injectable,
	CanActivate,
	ExecutionContext,
	NotFoundException,
	ForbiddenException,
	UnauthorizedException,
  } from '@nestjs/common';
  import { Request } from 'express';
import { BlogsQueryRepositoryForSA } from '../blogsForSA.queryReposity';
  
  @Injectable()
  export class ForbiddenCalss implements CanActivate {
	constructor(protected blogsQueryRepositoryForSA: BlogsQueryRepositoryForSA) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
	  const req: Request = context.switchToHttp().getRequest();
	  const blogId = req.params.blogId;
	  if (!blogId) throw new NotFoundException('404');
	  const findBlogById = await this.blogsQueryRepositoryForSA.findBlogById(
		blogId,
	  );
	  if (!findBlogById) throw new NotFoundException('404');
	  if (!req['user']) throw new UnauthorizedException('401');
	  const userId = req.user!.id.toString();
	  if (findBlogById.userId !== userId) throw new ForbiddenException('403');
	  return true;
	}
  }
  