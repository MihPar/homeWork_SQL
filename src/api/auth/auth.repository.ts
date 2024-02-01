import { Injectable } from '@nestjs/common';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { IPCollectionClass } from './dto/auth.class.type';

@Injectable()
export class AuthRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async create(objCollection: IPCollectionClass) {
    const createNewCollection = await this.dataSource.query(`
	INSERT INTO public."IpCollection"(
		"IP", "URL", "Date")
		VALUES ('objCollection.IP', 'objCollection.URL', 'objCollection.date');
	`);
		if(!createNewCollection) return false
		return true
  }

  async getCount() {
	// const tenSecondsAgo = new Date(Date.now() - 10000);
	const count = await this.dataSource.query(`
	SELECT count(*)
		FROM "IpCollection"
		WHERE "IP" = objCollection.IP
		AND "Date" > CURRENT_TIMESTAMP -INTERVAL '10 seconds'
	`)
	return count
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
