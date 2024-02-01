import { Injectable } from '@nestjs/common';
import  bcrypt  from 'bcrypt';

@Injectable()
export class GenerateHashAdapter {
	constructor() {}
	async _generateHash(password: string): Promise<string> {
		const hash: string = await bcrypt.hash(password, 3);
		return hash;
	  }
}

