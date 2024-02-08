import { BadRequestException, Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Query, UseFilters, UseGuards } from '@nestjs/common';
import { UsersQueryRepository } from './users.queryRepository';
import { CommandBus } from '@nestjs/cqrs';
import { AuthBasic } from './gards/basic.auth';
import { DeleteUserByIdCommnad } from './useCase/deleteUserById-use-case';
import { InputDataReqClass } from '../auth/dto/auth.class.pipe';
import { HttpExceptionFilter } from '../../infrastructura/exceptionFilters.ts/exceptionFilter';
import { RegistrationCommand } from './useCase/registration-use-case';
import { CreateNewUserCommand } from './useCase/createNewUser-use-case';
import { dtoType } from './user.class';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@UseGuards(AuthBasic)
@Controller('sa/users')
export class UsersController {
  constructor(
	protected usersQueryRepository: UsersQueryRepository,
	protected commandBus: CommandBus
	) {}

  @Get()
  @HttpCode(200)
  async getAllUsers(
    @Query()
    query: {
      sortBy: string;
      sortDirection: string;
      pageNumber: string;
      pageSize: string;
      searchLoginTerm: string;
      searchEmailTerm: string;
    },
  ) {
		query.sortBy = query.sortBy || 'createdAt'
		query.sortDirection = query.sortDirection || "desc"
		query.pageNumber = query.pageNumber || '1'
		query.pageSize = query.pageSize || '10'
		query.searchLoginTerm = query.searchLoginTerm || ''
		query.searchEmailTerm = query.searchEmailTerm || ''
		
    const users = await this.usersQueryRepository.getAllUsers(
		query.sortBy,
		query.sortDirection,
		query.pageNumber,
		query.pageSize,
		query.searchLoginTerm,
		query.searchEmailTerm
    );
	return users
  }

  @HttpCode(201)
  @Post()
  @UseFilters(new HttpExceptionFilter())
  async createUser(@Body() inputDataReq: InputDataReqClass) {
	console.log("createUser")
	const command = new CreateNewUserCommand(inputDataReq)
	const createUser = await this.commandBus.execute(command)
	if(!createUser) throw new BadRequestException("400")
	console.log("createUser: ", createUser)
	return createUser
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteUserById(@Param() dto: dtoType) {
	if(!dto.id) throw new NotFoundException("Blogs by id not found 404")
	const command = new DeleteUserByIdCommnad(dto.id)
	const deleteUserById = await this.commandBus.execute(command)
	if (!deleteUserById) throw new NotFoundException("Blogs by id not found 404")
	return deleteUserById
  }
}
