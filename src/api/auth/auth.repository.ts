import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { IPCollectionClass } from '../CollectionIP/auth.class.type';

@Injectable()
export class AuthRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async create(objCollection: IPCollectionClass) {
    const createNewCollection = await this.dataSource.query(`
	INSERT INTO public."IpCollection"(
		"ip", "url", "date")
		VALUES ('${objCollection.ip}', '${objCollection.url}', '${objCollection.date}');
	`);
		if(!createNewCollection) return false
		return true
  }

  async getCount(objCollection) {
	// const tenSecondsAgo = new Date(Date.now() - 10000);
	const count = await this.dataSource.query(`
	SELECT count(*)
		FROM "IpCollection"
		WHERE "ip" = '${objCollection.ip}'
		AND "date" > CURRENT_TIMESTAMP -INTERVAL '10 seconds'
	`)
	return count
  }
}
