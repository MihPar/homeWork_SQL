import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Injectable } from "@nestjs/common";

import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { UsersQueryRepository } from "../../users/users.queryRepository";
import { UserClass } from "../../users/user.class";
import { BlogsQueryRepositoryForSA } from "../../blogsForSA/blogsForSA.queryReposity";
import { BlogClass } from "../../blogs/blogs.class";
import { BlogsViewTypeWithUserId } from "../../blogs/blogs.type";

@ValidatorConstraint({ name: "login", async: true })
@Injectable()
export class CustomIdValidation implements ValidatorConstraintInterface {
  constructor(
	protected readonly blogsQueryRepositoryForSA: BlogsQueryRepositoryForSA
	) {}
  async validate(value: string): Promise<boolean> {
	// console.log("login")
    const blog: BlogsViewTypeWithUserId | null = await this.blogsQueryRepositoryForSA.findBlogById(value);
	// console.log("value: ", value)
	// console.log("user: ", user)
    if (!blog) {
      throw new NotFoundException([{ message: "this blog not found", field: "blogId" }]);
    } else {
      return true;
    }
  }
}
