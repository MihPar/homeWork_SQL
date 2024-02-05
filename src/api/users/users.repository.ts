import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { add } from 'date-fns';
import { UserClass } from './user.class';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {}

  async passwordRecovery(id: any, recoveryCode: string): Promise<boolean> {
	const recoveryInfo = {
		recoveryCode,
		expirationDate: add(new Date(), {minutes: 5}) 
	}
	const updateRes = await this.dataSource.query(`
	UPDATE public."Users" as u
			SET 
				"ExpirationDate"='${recoveryInfo.expirationDate}', 
				"ConfirmationCode"='${recoveryInfo.recoveryCode}'
		WHERE u."Id" = '${id}'
	`)
    if(!updateRes) return false
	return true
  }

  async updatePassword(id: any, newPasswordHash: string) {
    const updatePassword = await this.dataSource.query(`
			UPDATE public."Users" as u
				SET "PassswordHash"='${newPasswordHash}'
				WHERE u."Id" = '${id}'
	`)
    if(!updatePassword) return false
	return  true
  }

  async updateConfirmation(id: string) {
    const result = await this.dataSource.query(`
	UPDATE public."Users" as u
		SET "IsConfirmed"='${true}'
		WHERE u."UserId" = '${id}'
	`)
    return true
  }

  async createUser(newUser: UserClass) {
    	await this.dataSource.query(`
			INSERT INTO public."Users"("userName", "email", "createdAt", "passwordHash", "confirmationCode", "expirationDate", "isConfirmed")
				VALUES ('${newUser.userName}', '${newUser.email}', 
				'${newUser.createdAt}', '${newUser.passwordHash}', '${newUser.confirmationCode}', 
				'${newUser.expirationDate}', '${newUser.isConfirmed}')
	`)
    return newUser;
  }

  async updateUserConfirmation(
    id: string,
    confirmationCode: string,
    newExpirationDate: Date
  ): Promise<boolean> {
    const result = await this.dataSource.query(`
	UPDATE public."Users" as u
		SET "ExpirationDate"='${newExpirationDate}', "ConfirmationCode"='${confirmationCode}'
		WHERE u."Id' = '${id}'
	`)
	if(!result) return false
	return true
  }

  async deleteById(userId: string) {
	const deleted = await this.dataSource.query(`
		DELETE FROM public."Users" as u
			WHERE u."Id" = '${userId}'
	`)
	if(!deleted) return false
	return true
  }

  async deleteAll() {
	const deleteAllUsers = await this.dataSource.query(`
		DELETE FROM public."Users"
	`);
    return true
  }
}
