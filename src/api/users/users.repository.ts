import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {}

  async passwordRecovery(id: ObjectId, recoveryCode: string): Promise<boolean> {
    const recoveryInfo = {
      ["emailConfirmation.confirmationCode"]: recoveryCode,
      ["emailConfirmation.expirationDate"]: add(new Date(), { minutes: 5 }),
    };
    const updateRes = await this.userModel.updateOne(
      { _id: new ObjectId(id) },
      { $set: recoveryInfo }
    );
    return updateRes.matchedCount === 1;
  }

  create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User();
    user.firstName = createUserDto.firstName;
    user.lastName = createUserDto.lastName;

    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User> {
    return this.usersRepository.findOneBy({ id: id });
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
