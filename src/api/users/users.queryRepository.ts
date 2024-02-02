import "reflect-metadata"
import { Injectable } from '@nestjs/common';
import { DataSource, WithId } from "typeorm";
import { InjectDataSource } from "@nestjs/typeorm";
import { PaginationType } from "src/types/pagination.types";
import { UserViewType } from "./user.type";
import { UserClass } from "./user.class";

@Injectable()
export class UsersQueryRepository {
	constructor(
		@InjectDataSource() protected dateSource: DataSource
	) {}
	// async getAllUsers(
	// 	sortBy: string,
	// 	sortDirection: string,
	// 	pageNumber: string,
	// 	pageSize: string,
	// 	searchLoginTerm: string,
	// 	searchEmailTerm: string
	//   ): Promise<PaginationType<UserViewType>> {
	// 	const filter = {
	// 		$or: [
	// 			{"accountData.userName": {$regex: searchLoginTerm || "",$options: "i"}},
	// 			{"accountData.email": {$regex: searchEmailTerm ?? "", $options: "i"}}
	// 		],
	// 	};
	// 	if(sortBy === "login") {
	// 		sortBy = "userName"
	// 	}
	// 	const getAllUsers: UserClass[] = await this.userModel.find(filter)
	// 	  .sort({ [`accountData.${sortBy}`]: sortDirection === "asc" ? 1 : -1 })
	// 	  .skip((+pageNumber - 1) * +pageSize)
	// 	  .limit(+pageSize)
	// 	  .lean()
	
	// 	const totalCount: number = await this.userModel.countDocuments(filter);
	// 	const pagesCount: number = await Math.ceil(totalCount / +pageSize);
	// 	return {
	// 	  pagesCount: pagesCount,
	// 	  page: +pageNumber,
	// 	  pageSize: +pageSize,
	// 	  totalCount: totalCount,
	// 	  items: getAllUsers.map((user: UserClass): UserViewType => ({
	// 			id: user._id.toString(),
	// 			login: user.accountData.userName,
	// 			email: user.accountData.email,
	// 			createdAt: user.accountData.createdAt,
	// 		})),
	// 	};
	//   }

	  async findByLoginOrEmail(loginOrEmail: string): Promise<UserClass | null> {
		const user: UserClass | null = await this.dateSource.query(`
		SELECT u.*
			FROM public."Users" as u
			WHERE u."UserName" = '${loginOrEmail}' AND u."Email" = '${loginOrEmail}'
		`)
		return user;
	  }

	  async findUserByEmail(email: string) {
		return this.dateSource.query(`
			SELECT u.*
				FROM public."Users" as u
				WHERE u."Email" = '${email}'
		`)
	  }

	  async findUserByCode(recoveryCode: string): Promise<WithId<UserClass> | null> {
		return this.dateSource.query(`
		SELECT e.*
			FROM public."EmailConfirmation" as e
			WHERE e."ComfirmationCode" = '${recoveryCode}'
		`)
	  }

	//   async findUserByConfirmation(code: string): Promise<UserClass | null> {
	// 	const user: UserClass | null = await this.userModel.findOne({
	// 	  "emailConfirmation.confirmationCode": code,
	// 	}).lean();
	// 	return user;
	//   }

	//   async findUserById(userId: string): Promise<UserClass | null> {
	// 	let user: UserClass | null = await this.userModel.findOne({ _id: new ObjectId(userId) }).lean();
	// 	return user;
	//   }
}
