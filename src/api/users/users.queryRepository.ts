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
				select *
					from public."Users"
						WHERE "userName" ILIKE $1 OR "email" ILIKE $2
						order by "${sortBy}" ${sortDirection}
						limit $3 offset $4
	`;

    const findAllUsers = await this.dataSource.query(queryFilter, [
      `%${searchLoginTerm}%`,
      `%${searchEmailTerm}%`,
      +pageSize,
      (+pageNumber - 1) * +pageSize,
    ]);

    // console.log("findAllUsers: ", findAllUsers);
    const countTotalCount = `
		SELECT count(*)
			from "Users"
				WHERE "userName" ILIKE $1 OR "email" ILIKE $2
	`;

    const resultCount = await this.dataSource.query(countTotalCount, [
      `%${searchLoginTerm}%`,
      `%${searchEmailTerm}%`,
    ]);
    const totalCount = resultCount[0].count;
    // console.log("totalCount: ", totalCount);

    const pagesCount: number = await Math.ceil(totalCount / +pageSize);
    return {
      pagesCount: pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount,
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
    const user: UserClass | null = (
      await this.dataSource.query(`
		SELECT *
			FROM public."Users"
			WHERE "userName" = '${loginOrEmail}' OR "email" = '${loginOrEmail}'
		`)
    )[0];
    // console.log("user: ", user)
    return user;
  }

  async findUserByEmail(email: string): Promise<UserClass | null> {
    const user: UserClass | null = (
      await this.dataSource.query(`
			SELECT *
				FROM public."Users"
				WHERE "email" = '${email}'
		`)
    )[0];
    // console.log("user by email: ", user)
    return user;
  }

  async findUserByLogin(login: string): Promise<UserClass | null> {
    const user: UserClass | null = (
      await this.dataSource.query(`
			SELECT *
				FROM public."Users"
				WHERE "userName" = '${login}'
		`)
    )[0];
    return user;
  }

  async findUserByCode(
    recoveryCode: string
  ): Promise<WithId<UserClass> | null> {
    const result = await this.dataSource.query(`
		SELECT *
			FROM public."Users"
			WHERE "confirmationCode" = '${recoveryCode}'
		`);
    // console.log("result: ", result);
    return result[0];
  }

  async findUserByConfirmation(code: string): Promise<UserClass | null> {
	// console.log("findUserByConfirmation: ")
    const user: UserClass | null = (
      await this.dataSource.query(`
		SELECT *
			FROM public."Users"
			WHERE "confirmationCode" = $1
	`,
        [code]
      )
    )[0];
	// console.log("user: ", user)
    return user;
  }

  async findUserById(userId: string): Promise<UserClass | null> {
    let user: UserClass | null = (
      await this.dataSource.query(`
			SELECT *
				FROM public."Users"
				WHERE "id" = '${userId}'
		`)
    )[0];
    return user;
  }
}
