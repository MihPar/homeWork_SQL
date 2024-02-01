import { Injectable } from '@nestjs/common';
import { EmailAdapter } from './email.adapter';

@Injectable()
export class EmailManager {
	constructor(
		protected emailAdapter: EmailAdapter
	) {
	}
	async sendEamilConfirmationMessage(email: string, code: string): Promise<void> {
		await this.emailAdapter.sendEmail(email, code)
	}
	async sendEamilRecoveryCode(email: string, recoveryCode: string) {
		const result = await this.emailAdapter.sendEmailByRecoveryCode(email, recoveryCode)
	}
}
