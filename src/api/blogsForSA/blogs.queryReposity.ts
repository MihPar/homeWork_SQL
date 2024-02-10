import { Injectable } from "@nestjs/common";
import { PaginationType } from "../../types/pagination.types";
import { BlogsViewType } from "./blogs.type";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { BlogClass } from "../blogs/blogs.class";

@Injectable()
export class BlogsQueryRepositoryForSA {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findAllBlogs(
    searchNameTerm: string | null,
    sortBy: string,
    sortDirection: string,
    pageNumber: string,
    pageSize: string
  ): Promise<PaginationType<BlogsViewType>> {
	const query1 = `
		select *
			from public."Blogs"
			where "name" = $1
			order by $2 ${sortDirection}
			limit $3 offset $4
	`

	const blogs = await this.dataSource.query(query1, [
		`%${searchNameTerm}%`,
		sortBy,
		+pageSize,
		(+pageNumber - 1) * +pageSize
	])

	const query2 = `
		select count(*)
			from "Blogs"
			where "name" = $1
	`
	const totalCount = (await this.dataSource.query(query2, [`%${searchNameTerm}%`]))[0].count
    const pagesCount: number = Math.ceil(+totalCount / +pageSize);

    const result: PaginationType<BlogsViewType> = {
      pagesCount: pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount,
      items: blogs.map((item) => BlogClass.getBlogsViewModel(item)),
    };
    return result;
  }

  async findRawBlogById(
    blogId: string,
    userId?: string
  ): Promise<BlogClass | null> {
    const blog: BlogClass | null = await this.blogModel
      .findOne({ _id: new ObjectId(blogId) }, { __v: 0 })
      .lean();
    return blog;
  }

  async findBlogById(
    blogId: string,
    userId?: string
  ): Promise<BlogsViewType | null> {
	const query = `
		select *
			from "Blogs"
			where "blogId" = $1 AND "userId" = $2
	`
    const blog: BlogClass | null = await this.dataSource.query(query, [blogId, userId])
    return blog ? BlogClass.getBlogsViewModel(blog) : null;
  }
}