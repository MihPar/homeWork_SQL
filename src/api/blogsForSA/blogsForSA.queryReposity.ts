import { Injectable } from "@nestjs/common";
import { PaginationType } from "../../types/pagination.types";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { BlogClass, Blogs } from "../blogs/blogs.class";
import { BlogsViewType, BlogsViewTypeWithUserId } from "../blogs/blogs.type";

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
			where "name" ILIKE $1
			order by "${sortBy}" ${sortDirection}
			limit $2 offset $3
	`

	const findAllBlogs = await this.dataSource.query(query1, [
		`%${searchNameTerm}%`,
		+pageSize,
		(+pageNumber - 1) * +pageSize
	])

	const query2 = `
		select count(*)
			from "Blogs"
			where "name" ILIKE $1
	`
	const totalCount = (await this.dataSource.query(query2, [`%${searchNameTerm}%`]))[0].count
    const pagesCount: number = Math.ceil(+totalCount / +pageSize);

    const result: PaginationType<BlogsViewType> = {
      pagesCount: pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount,
      items: findAllBlogs.map((item) => BlogClass.createNewBlogForSA(item)),
    };
    return result;
  }

//   async findRawBlogById(
//     blogId: string,
//     userId?: string
//   ): Promise<BlogClass | null> {
//     const blog: BlogClass | null = await this.blogModel
//       .findOne({ _id: new ObjectId(blogId) }, { __v: 0 })
//       .lean();
//     return blog;
//   }

  async findBlogById(
    blogId: string,
    userId?: string
  ): Promise<BlogsViewTypeWithUserId | null> {
	const query = `
		select *
			from "Blogs"
			where "id" = $1
	`
    const blog: BlogClass | null = (await this.dataSource.query(query, [blogId]))[0]
    return blog ? BlogClass.getBlogsViewModel(blog) : null;
  }

  async deletedBlog(id: string): Promise<boolean | null> {
	const query = `
		delete from public."Blogs"
			where "id" = $1
	`
    const result = (await this.dataSource.query(query, [id]))[0]
    if(!result) return null
	return true
  }
}