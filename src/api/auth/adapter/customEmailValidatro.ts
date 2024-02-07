import {
  BadRequestException,
  Injectable,
} from "@nestjs/common";

import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { UsersQueryRepository } from "../../users/users.queryRepository";

@ValidatorConstraint({ name: "email", async: true })
@Injectable()
export class CustomEmailvalidation implements ValidatorConstraintInterface {
  constructor(protected readonly usersQueryRepository: UsersQueryRepository) {}
  async validate(value: string): Promise<boolean> {
	console.log("email")
    const user = await this.usersQueryRepository.findUserByEmail(value);
    if (user) {
      throw new BadRequestException([{ message: "email already exists", field: "email" }]);
    } else {
      return true;
    }
  }
}
