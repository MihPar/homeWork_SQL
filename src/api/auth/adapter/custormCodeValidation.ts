import { BadRequestException } from "@nestjs/common";
import { Injectable } from "@nestjs/common";

import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { UsersQueryRepository } from "../../users/users.queryRepository";
import { UserClass } from "../../users/user.class";

@ValidatorConstraint({ name: "code", async: true })
@Injectable()
export class CustomCodealidation implements ValidatorConstraintInterface {
  constructor(
	protected readonly usersQueryRepository: UsersQueryRepository
	) {}
  async validate(value: string): Promise<boolean> {
    const user: UserClass | null = await this.usersQueryRepository.findUserByCode(value);
    if (user) {
      throw new BadRequestException([{ message: "code already exists", field: "code" }]);
    } else {
      return true;
    }
  }
}
