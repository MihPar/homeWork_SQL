import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
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
    const user = await this.usersQueryRepository.findUserByEmail(value);
    if (user) {
      throw new BadRequestException("email already exists");
    } else {
      return true;
    }
  }
}
