import { Injectable } from '@nestjs/common';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { IPCollectionClass } from './entities/auth.class.type';

@Injectable()
export class AuthRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async create(objCollection: IPCollectionClass) {
    const createNewCollection = await this.dataSource.query(`
	INSERT INTO public."IpCollection"(
		"IP", "URL", "Date")
		VALUES ('objCollection.IP', 'objCollection.URL', 'objCollection.date');
	`);

	const tenSecondsAgo = new Date(Date.now() - 10000);
	
	const count = await this.dataSource.query(`
	SELECT count(*)
		FROM "IpCollection" as Ip
		WHERE "Ip" = 
	`)
	
	
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
