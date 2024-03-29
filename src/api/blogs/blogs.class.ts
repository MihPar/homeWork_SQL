import { BlogsViewType } from "./blogs.type";

export class Blogs {
	public createdAt: string
	constructor(
		public name: string,
		public description: string,
		public websiteUrl: string,
		public isMembership: boolean,
		) {
			this.createdAt = new Date().toISOString()
		}
  };


export class BlogClass extends Blogs {
	constructor(
		name: string,
		description: string,
		websiteUrl: string,
		isMembership: boolean,
		) {
		super(name, description, websiteUrl, isMembership)
	}
		id: string
		name: string
		description: string
		websiteUrl: string
		createdAt: string
		isMembership: boolean
		userId: string

		static getBlogsViewModel(inputBlog: BlogClass) {
			return {
				id: inputBlog.id,
				name: inputBlog.name,
				description: inputBlog.description,
				websiteUrl: inputBlog.websiteUrl,
				createdAt: inputBlog.createdAt,
				isMembership: inputBlog.isMembership,
				userId: inputBlog.userId
			}
		}

		static createNewBlogForSA(inputBlog: BlogClass) {
			return {
				id: inputBlog.id,
				name: inputBlog.name,
				description: inputBlog.description,
				websiteUrl: inputBlog.websiteUrl,
				createdAt: inputBlog.createdAt,
				isMembership: inputBlog.isMembership,
			}
		}

		getBlogViewModel(): BlogsViewType {
			return {
				id: this.id,
				name: this.name,
				description: this.description,
				websiteUrl: this.websiteUrl,
				createdAt: this.createdAt,
				isMembership: this.isMembership
			}
		}
}