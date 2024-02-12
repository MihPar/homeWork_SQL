import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { BlogClass } from "./blogs.class";

@Injectable()
export class BlogsRepository {
	constructor(
		@InjectDataSource() protected dataSource: DataSource
	) {}
  async deleteRepoBlogs() {
    await this.dataSource.query(`
		DELETE FROM public."Blogs"
	`);
    return true
  }

//   async createNewBlogs(newBlog: BlogClass): Promise<BlogClass | null> {
// 	try {
// 		const result = await this.blogModel.create(newBlog);
// 		await result.save()
// 		return newBlog
// 	} catch(error) {
// 		console.log(error, 'error in create post');
//       return null;
// 	}
    
//   }

//   async updateBlogById(
//     id: string,
//     name: string,
//     description: string,
//     websiteUrl: string,
//   ): Promise<BlogClass | any> {
//     const result = await this.blogModel.updateOne(
//       { _id: id },
//       {
//         $set: { name: name, description: description, websiteUrl: websiteUrl },
//       },
//     );
//     return result.matchedCount === 1
//   }

//   async deletedBlog(id: string) {
//     const result = await this.blogModel.deleteOne({ _id: new ObjectId(id) });
//     return result.deletedCount === 1;
//   }
}