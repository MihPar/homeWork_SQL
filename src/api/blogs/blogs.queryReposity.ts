import { Injectable } from "@nestjs/common";
import { PaginationType } from "../../types/pagination.types";
import { BlogsViewType } from "./blogs.type";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { BlogClass } from "./blogs.class";

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findAllBlogs(
    searchNameTerm: string | null,
    sortBy: string,
    sortDirection: string,
    pageNumber: string,
    pageSize: string
  ): Promise<PaginationType<BlogsViewType>> {
    const getFilter = `
			SELECT *
				FROM public."Blogs"
					WHERE "name" ILIKE $1
					ORDER BY $2 ${sortDirection}
					LIMIT $3 OFFSET $4
		`;
    const findAllBlogs = await this.dataSource.query(getFilter, [
      `%${searchNameTerm}%`,
      sortBy,
      +pageSize,
      (+pageNumber - 1) * +pageSize,
    ]);
console.log("findAllBlogs: ", findAllBlogs)
    const count = `
			SELECT count(*)
				FROM public."Blogs"
					WHERE "name" ILIKE $1
		`;
    const totalCount = (
      await this.dataSource.query(count, [`${searchNameTerm}`])
    )[0].count;
    const pagesCount: number = Math.ceil(totalCount / +pageSize);

    const result: PaginationType<BlogsViewType> = {
      pagesCount: pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: totalCount,
      items: findAllBlogs.map((item) => BlogClass.createNewBlogForSA(item)),
    };
    return result;
  }

  // async findRawBlogById(blogId: string, userId?: string): Promise<BlogClass | null> {
  // 	const blog: BlogClass | null =  await this.blogModel.findOne({ _id: new ObjectId(blogId) }, {__v: 0}).lean();
  // 	return blog
  //   }

  async findBlogById(blogId: string): Promise<BlogsViewType | null> {
	const query = `
		SELECT *
			FROM public."Blogs"
			WHERE "id" = $1
	`
  	const blog: BlogClass | null = (await this.dataSource.query(query, [blogId]))[0]
  	return blog ? BlogClass.createNewBlogForSA(blog) : null;
    }
}