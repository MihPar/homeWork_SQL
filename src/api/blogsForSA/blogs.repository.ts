import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { BlogClass } from "../blogs/blogs.class";


@Injectable()
export class BlogsRepositoryForSA {
	constructor(
		@InjectDataSource() protected dataSource: DataSource
	) {}
  async createNewBlogs(newBlog: BlogClass): Promise<BlogClass | null> {
	try {
		const query1 = `
			INSERT INTO public."Blogs"(
				"name", "description", "websiteUrl", "createdAt", "isMembership")
				VALUES ($1, $2, $3, $4, $5)
				returning *
		`;
		const insert = (
      await this.dataSource.query(query1, [
        newBlog.name,
        newBlog.description,
        newBlog.websiteUrl,
        new Date().toISOString(),
        newBlog.isMembership,
      ])
    )[0];
		return insert
	} catch(error) {
		console.log(error, 'error in create post');
      return null;
	}
    
  }

  async updateBlogById(
    blogId: string,
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<BlogClass | any> {

	const query = `
		UPDATE public."Blogs"
			SET name=$1, description=$2, "websiteUrl"=$3
			WHERE "id"=$4
			returning *
		`
    const result = (await this.dataSource.query(query, [name, description, websiteUrl, blogId]))[0]
	// console.log("result: ", result)
	if(!result) return false
    return true
  }

  

  async deleteRepoBlogsFroSA() {
	await this.dataSource.query(`
		delete from public."Blogs"
	`)
	return true
  }
}