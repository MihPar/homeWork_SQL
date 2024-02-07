import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { add } from 'date-fns';
import { UserClass } from './user.class';

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async passwordRecovery(id: any, recoveryCode: string): Promise<boolean> {
    const recoveryInfo = {
      recoveryCode,
      expirationDate: add(new Date(), { minutes: 5 }),
    };
    const query = `
		UPDATE public."Users"
				SET 
					"expirationDate"='${recoveryInfo.expirationDate}', 
					"confirmationCode"='${recoveryInfo.recoveryCode}'
			WHERE "id" = $1
			RETURNING *
	`;
    const updateRes = await this.dataSource.query(query, [id]);
    if (!updateRes) return false;
    return true;
  }

  async updatePassword(id: any, newPasswordHash: string) {
    const query = `
		UPDATE public."Users"
			SET "passswordHash"= $1
			WHERE "id" = $2
			RETURNING *
`;
    const updatePassword = await this.dataSource.query(query, [
      newPasswordHash,
      id,
    ]);
    if (!updatePassword) return false;
    return true;
  }

  async updateConfirmation(id: string) {
    const result = await this.dataSource.query(
      `
		UPDATE public."Users"
			SET "isConfirmed"=true
			WHERE "id" = $1
	`,
      [id]
    );
    return true;
  }

  async createUser(newUser: UserClass) {
    const userId = await this.dataSource.query(`
			INSERT INTO public."Users"("userName", "email", "passwordHash", "createdAt",  "confirmationCode", "expirationDate", "isConfirmed")
				VALUES ('${newUser.userName}', '${newUser.email}', 
				'${newUser.passwordHash}', '${newUser.createdAt}', 
				'${newUser.confirmationCode}', '${newUser.expirationDate}', '${newUser.isConfirmed}')
				returning id
	`);
	// return newUser
	// const selectUser = `
	// 	select *
	// 		from "Users"
	// 			where "passwordHash" = $1
	// `
	// const getNewUser = await this.dataSource.query(selectUser, [newUser.passwordHash])
	console.log('userId[0].id', userId[0].id)
    return userId[0].id
  }

  async updateUserConfirmation(
    id: string,
    confirmationCode: string,
    newExpirationDate: Date
  ): Promise<boolean> {
    const query = `
		UPDATE public."Users"
			SET "expirationDate"=$1, "confirmationCode"=$2
			WHERE "id' = $3
			RETURNING *
	`;
    const result = await this.dataSource.query(query, [
      newExpirationDate,
      confirmationCode,
      id,
    ]);
    if (!result) return false;
    return true;
  }

  async deleteById(userId: string) {
	const query = `
		DELETE FROM public."Users"
			WHERE "id" = $1
	`
    const deleted = await this.dataSource.query(query, [userId]);
	console.log("deleted: ", deleted)
    if (!deleted) return false;
    return true;
  }

  async deleteAll() {
    const deleteAllUsers = await this.dataSource.query(`
		DELETE FROM public."Users"
	`);
    return true;
  }
}
