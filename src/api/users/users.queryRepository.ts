import "reflect-metadata"
import { Injectable } from '@nestjs/common';
import { DataSource, WithId } from "typeorm";
import { InjectDataSource } from "@nestjs/typeorm";
import { UserViewType } from './user.type';
import { PaginationType } from "../../types/pagination.types";
import { UserClass } from "./user.class";

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async getAllUsers(
    sortBy: string,
    sortDirection: string,
    pageNumber: string,
    pageSize: string,
    searchLoginTerm: string,
    searchEmailTerm: string
  ): Promise<PaginationType<UserViewType>> {

	if (sortBy === "login") {
		sortBy = "userName";
	  }

	const queryFilter = `
		SELECT ru.*
			FROM (
				select *
					from "Users"
						order by "createdAt" $1
						limit $2 offset $3
			) as ru
			WHERE ru."userName" LIKE $4 AND ru."email" LIKE $5
	`

const findAllUsers = await this.dataSource.query(queryFilter, [
  sortDirection,
  (+pageNumber - 1) * +pageSize,
  +pageSize,
  `%${searchLoginTerm}%`,
  `%${searchEmailTerm}%`
]);

    // const getAllUsers: UserClass[] = await this.userModel
    //   .find(filter)
    //   .sort({ [`accountData.${sortBy}`]: sortDirection === "asc" ? 1 : -1 })
    //   .skip((+pageNumber - 1) * +pageSize)
    //   .limit(+pageSize)
    //   .lean();

    const countTotalCount = `
		SELECT count(ru.*)
				FROM (
					select *
						from "Users"
							order by "createdAt" $1
							limit $2 offset $3
				) as ru
				WHERE ru."userName" LIKE $4 AND ru."email" LIKE $5
	`

	const totalCount = await this.dataSource.query(countTotalCount, [
		sortDirection,
		(+pageNumber - 1) * +pageSize,
		+pageSize,
		`%${searchLoginTerm}%`,
		`%${searchEmailTerm}%`
	])

    const pagesCount: number = await Math.ceil(totalCount / +pageSize);
    return {
      pagesCount: pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: totalCount,
      items: findAllUsers.map(
        (user: UserClass): UserViewType => ({
          id: user.id.toString(),
          login: user.userName,
          email: user.email,
          createdAt: user.createdAt,
        })
      ),
    };
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserClass | null> {
    const user: UserClass | null = (await this.dataSource.query(`
		SELECT *
			FROM public."Users"
			WHERE "userName" = '${loginOrEmail}' OR "email" = '${loginOrEmail}'
		`))[0]
    return user
  }

  async findUserByEmail(email: string): Promise<UserClass> {
    const user: UserClass = await this.dataSource.query(`
			SELECT *
				FROM public."Users"
				WHERE "email" = '${email}'
		`)[0]
    return user;
  }

  async findUserByCode(
    recoveryCode: string
  ): Promise<WithId<UserClass> | null> {
    const result = this.dataSource.query(`
		SELECT *
			FROM public."Users"
			WHERE "confirmationCode" = '${recoveryCode}'
		`)[0]
		console.log("result: ", result)
		return result

  }

  async findUserByConfirmation(code: string): Promise<UserClass | null> {
    const user: UserClass | null = await this.dataSource.query(`
			SELECT *
				FROM public."Users"
					WHERE "confirmationCode" = $1
		`, [code])
		console.log("user: ", user)
    return user;
  }

  async findUserById(userId: string): Promise<UserClass | null> {
    let user: UserClass | null = await this.dataSource.query(`
			SELECT *
				FROM public."Users"
				WHERE "id" = '${userId}'
		`)[0]
    return user;
  }
}
