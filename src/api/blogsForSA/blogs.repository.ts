import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { BlogClass } from "../blogs/blogs.class";
import { query } from "express";

@Injectable()
export class BlogsRepositoryForSA {
	constructor(
		@InjectDataSource() protected dataSource: DataSource
	) {}
  async createNewBlogs(newBlog: BlogClass): Promise<BlogClass | null> {
	try {
		const query = `
		INSERT INTO public."Blogs"(
			name, description, "websiteUrl", "createdAt", "isMembership", "userId")
			VALUES (${newBlog.name}, ${newBlog.description}, ${newBlog.websiteUrl}, ${newBlog.createdAt}, ${newBlog.isMembership}, ${newBlog.userId});

		`
		const result = (await this.dataSource.query(query))[0]
		return result
	} catch(error) {
		console.log(error, 'error in create post');
      return null;
	}
    
  }

  async updateBlogById(
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<BlogClass | any> {

	const query = `
		UPDATE public."Blogs"
			SET name=$1, description=$2, "websiteUrl"=$3
			WHERE "blogId" = $4
		`
    const result = (await this.dataSource.query(query, [name, description, websiteUrl, id]))[0]
	if(!result) return false
    return true
  }

  async deletedBlog(id: string): Promise<boolean | null> {
	const query = `
		select *
			from "Blogs"
			where "blogId" = $1
	`
    const result = (await this.dataSource.query(query, [id]))[0]
    if(!result) return null
	return true
  }
}