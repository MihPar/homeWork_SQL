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
export class CustomCodeValidation implements ValidatorConstraintInterface {
  constructor(
	protected readonly usersQueryRepository: UsersQueryRepository
	) {}
  async validate(value: string): Promise<boolean> {
	console.log("CustomCodeValidation")
    const user: UserClass | null = await this.usersQueryRepository.findUserByConfirmation(value);
	console.log("user: ", user)
    if (user) {
      throw new BadRequestException([{ message: "code already exists", field: "code" }]);
    } else {
      return true;
    }
  }
}
