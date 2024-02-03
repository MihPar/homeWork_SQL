import { UserClass } from 'src/api/users/user.class';
import "reflect-metadata"
import { Injectable } from '@nestjs/common';
import { DataSource, WithId } from "typeorm";
import { InjectDataSource } from "@nestjs/typeorm";
import { PaginationType } from 'src/types/pagination.types';
import { UserViewType } from './user.type';

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
    const filter = {
      $or: [
        {
          "accountData.userName": {
            $regex: searchLoginTerm || "",
            $options: "i",
          },
        },
        {
          "accountData.email": { $regex: searchEmailTerm ?? "", $options: "i" },
        },
      ],
    };
    if (sortBy === "login") {
      sortBy = "userName";
    }
    const getAllUsers: UserClass[] = await this.userModel
      .find(filter)
      .sort({ [`accountData.${sortBy}`]: sortDirection === "asc" ? 1 : -1 })
      .skip((+pageNumber - 1) * +pageSize)
      .limit(+pageSize)
      .lean();

    const totalCount: number = await this.userModel.countDocuments(filter);
    const pagesCount: number = await Math.ceil(totalCount / +pageSize);
    return {
      pagesCount: pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: totalCount,
      items: getAllUsers.map(
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
    const user: UserClass | null = await this.dataSource.query(`
		SELECT u.*
			FROM public."Users" as u
			WHERE u."UserName" = '${loginOrEmail}' OR u."Email" = '${loginOrEmail}'
		`);
    return user;
  }

  async findUserByEmail(email: string): Promise<UserClass> {
    const user: UserClass = await this.dataSource.query(`
			SELECT u.*
				FROM public."Users" as u
				WHERE u."Email" = '${email}'
		`);
    return user;
  }

  async findUserByCode(
    recoveryCode: string
  ): Promise<WithId<UserClass> | null> {
    return this.dataSource.query(`
		SELECT u.*
			FROM public."Users" as u
			WHERE u."ComfirmationCode" = '${recoveryCode}'
		`);
  }

  async findUserByConfirmation(code: string): Promise<UserClass | null> {
    const user: UserClass | null = await this.dataSource.query(`
			SELECT u.*
				FROM public."Users" as u
					WHERE u."ConfirmationCode" = '${code}'
		`);
    return user;
  }

  async findUserById(userId: string): Promise<UserClass | null> {
    let user: UserClass | null = await this.dataSource.query(`
			SELECT u.*
				FROM public."Users" as u
				WHERE u."Id" = '${userId}'
		`);
    return user;
  }
}
