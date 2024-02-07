import { BadRequestException } from "@nestjs/common";
import { Injectable } from "@nestjs/common";

import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { UsersQueryRepository } from "../../users/users.queryRepository";
import { UserClass } from "../../users/user.class";

@ValidatorConstraint({ name: "login", async: true })
@Injectable()
export class CustomLoginvalidation implements ValidatorConstraintInterface {
  constructor(
	protected readonly usersQueryRepository: UsersQueryRepository
	) {}
  async validate(value: string): Promise<boolean> {
    const user: UserClass | null = await this.usersQueryRepository.findUserByLogin(value);
    if (user) {
      throw new BadRequestException([{ message: "Login already exists", field: "login" }]);
    } else {
      return true;
    }
  }
}
