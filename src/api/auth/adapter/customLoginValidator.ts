import { BadRequestException } from "@nestjs/common";
import { UsersRepository } from "./../../users/users.repository";
import { Injectable, UnprocessableEntityException } from "@nestjs/common";

import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { UsersQueryRepository } from "../../users/users.queryRepository";

@ValidatorConstraint({ name: "login", async: true })
@Injectable()
export class CustomLoginvalidation implements ValidatorConstraintInterface {
  constructor(protected readonly usersQueryRepository: UsersQueryRepository) {}

  async validate(value: string): Promise<boolean> {
    const user = await this.usersQueryRepository.findUserByLogin(value);
    if (user) {
      throw new BadRequestException("login already exists");
    } else {
      return true;
    }
  }
}
