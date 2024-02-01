import "reflect-metadata"
import { Injectable } from '@nestjs/common';
import { UserViewType} from './user.type';
import { InjectModel } from '@nestjs/mongoose';
import { UserClass, UserDocument } from '../../schema/user.schema';
import { Model } from 'mongoose';
import { PaginationType } from '../../types/pagination.types';
import { ObjectId, WithId } from 'mongodb';

@Injectable()
export class UsersQueryRepository {
	constructor(
		@InjectModel(UserClass.name) private userModel: Model<UserDocument>
	) {}
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
				{"accountData.userName": {$regex: searchLoginTerm || "",$options: "i"}},
				{"accountData.email": {$regex: searchEmailTerm ?? "", $options: "i"}}
			],
		};
		if(sortBy === "login") {
			sortBy = "userName"
		}
		const getAllUsers: UserClass[] = await this.userModel.find(filter)
		  .sort({ [`accountData.${sortBy}`]: sortDirection === "asc" ? 1 : -1 })
		  .skip((+pageNumber - 1) * +pageSize)
		  .limit(+pageSize)
		  .lean()
	
		const totalCount: number = await this.userModel.countDocuments(filter);
		const pagesCount: number = await Math.ceil(totalCount / +pageSize);
		return {
		  pagesCount: pagesCount,
		  page: +pageNumber,
		  pageSize: +pageSize,
		  totalCount: totalCount,
		  items: getAllUsers.map((user: UserClass): UserViewType => ({
				id: user._id.toString(),
				login: user.accountData.userName,
				email: user.accountData.email,
				createdAt: user.accountData.createdAt,
			})),
		};
	  }

	  async findByLoginOrEmail(loginOrEmail: string): Promise<UserClass | null> {
		const user: UserClass | null = await this.userModel.findOne({
		  $or: [
			{ "accountData.email": loginOrEmail },
			{ "accountData.userName": loginOrEmail },
		  ],
		}).lean(); 
		return user;
	  }

	  async findUserByEmail(email: string) {
		return this.userModel.findOne({ "accountData.email": email }).lean();
	  }

	  async findUserByCode(recoveryCode: string): Promise<WithId<UserClass> | null> {
		return this.userModel.findOne({
		  "emailConfirmation.confirmationCode": recoveryCode,
		}).lean();
	  }

	  async findUserByConfirmation(code: string): Promise<UserClass | null> {
		const user: UserClass | null = await this.userModel.findOne({
		  "emailConfirmation.confirmationCode": code,
		}).lean();
		return user;
	  }

	  async findUserById(userId: string): Promise<UserClass | null> {
		let user: UserClass | null = await this.userModel.findOne({ _id: new ObjectId(userId) }).lean();
		return user;
	  }
}
