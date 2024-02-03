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
	SELECT e.* FROM public."EmailConfirmation" as e 
		UPDATE public."EmailConfirmation"
		SET 
			"ExpirationDate"='${recoveryInfo.expirationDate}', 
			"ConfirmationCode"='${recoveryInfo.recoveryCode}'
		WHERE e."UserId" = '${id}'
	`)
    if(!updateRes) return false
	return true
  }

  async updatePassword(id: any, newPasswordHash: string) {
    const updatePassword = await this.dataSource.query(`
		SELECT u.* FROM public."Users" as u 
			UPDATE public."Users" SET "PassswordHash"='${newPasswordHash}'
			WHERE u."Id" = '${id}'
	`)
    if(!updatePassword) return false
	return  true
  }

  async updateConfirmation(id: string) {
    const result = await this.dataSource.query(`
	UPDATE public."EmailConfirmation" as e
		SET "IsConfirmed"='${true}'
		WHERE e."UserId" = '${id}'
	`)
    return true
  }

  async createUser(newUser: UserClass) {
    	await this.dataSource.query(`
		INSERT INTO public."Users"("UserName", "Email")
			VALUES ('${newUser.accountData.userName}', '${newUser.accountData.passwordHash}', '${newUser.accountData.email}', '${newUser.accountData.createdAt}', '${newUser.emailConfirmation.confirmationCode}', '${newUser.emailConfirmation.expirationDate}', '${newUser.emailConfirmation.isConfirmed}')
	`)
    return newUser;
  }
}
