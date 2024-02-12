import { Injectable } from '@nestjs/common';
import { LikeStatusEnum } from '../../api/likes/likes.emun';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostClass } from './post.class';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {}

  async createNewPosts(newPost: PostClass): Promise<PostClass | null> {
    try {
		const query = `
		INSERT INTO public."Posts"(
			"blogId", title, "shortDescription", content, "blogName", "createdAt", "likesCount", "dislikesCount", "myStatus")
			VALUES (${newPost.blogId}, ${newPost.title}, ${newPost.shortDescription}, ${newPost.content}, ${newPost.blogName}, ${newPost.createdAt}, ${newPost.likesCount}, ${newPost.dislikesCount}, ${newPost.myStatus});
		`
      const resultNewPost = (await this.dataSource.query(query))[0]
      return resultNewPost;
    } catch (error) {
      console.log(error, 'error in create post');
      return null;
    }
  }

  async updatePost(newPost: PostClass, id: string): Promise<PostClass> {
	const query = `
		UPDATE public."Posts"
			SET "blogId"=${newPost.blogId}, title=${newPost.title}, "shortDescription"=${newPost.shortDescription}, content=${newPost.content}, "blogName"=${newPost.blogName}, "createdAt"=${newPost.createdAt}, "likesCount"=${newPost.likesCount}, "dislikesCount"=${newPost.dislikesCount}, "myStatus"=${newPost.myStatus}
			WHERE "id" = $1
	`
    const result =( await this.dataSource.query(query, [id]))[0]
	return result
  }

  async deletedPostByIdWithBlogId(id: string, blogId: string): Promise<boolean> {
	const query = `
		delete from "Posts"
			where "id" = $1 and "blogid" = $2
	`
    const result = await this.dataSource.query(query, [id, blogId])
	if(!result) return false
	return true
  }

  async deleteRepoPosts() {
	const query = `
		DELETE FROM public."Posts"
	`
    await this.dataSource.query(query);
    return true
  }

  async increase(postId: string, likeStatus: string) {
    if (likeStatus === LikeStatusEnum.None) {
      return;
    } else if(likeStatus === 'Dislike') {
		let dislike = 'Dislike'
		const query = `
			UPDATE public."Posts"
				SET "likesCount"=${1}
				WHERE "id" = $1 AND "myStatus" = ${dislike}
		`
		return await this.dataSource.query(query, [postId])
	} else {
		let like = 'Like'
		const query = `
			UPDATE public."Posts"
				SET "dislikesCount"=${1}
				WHERE "id" = $1 AND "myStatus" = ${like}
		`
		return await this.dataSource.query(query, [postId])
	}
	
  }

  async decrease(postId: string, likeStatus: string) {
    if (likeStatus === LikeStatusEnum.None) {
      return;
    } else if(likeStatus === 'Dislike') {
		let dislike = 'Dislike'
		const query = `
			UPDATE public."Posts"
				SET "likesCount"=${-1}
				WHERE "id" = $1 AND "myStatus" = ${dislike}
		`
		return await this.dataSource.query(query, [postId])
	} else {
		let like = 'Like'
		const query = `
			UPDATE public."Posts"
				SET "dislikesCount"=${-1}
				WHERE "id" = $1 AND "myStatus" = ${like}
		`
		return await this.dataSource.query(query, [postId])
	}
	
    // return await this.postModel.updateOne(
    //   { _id: new ObjectId(postId) },
    //   {
    //     $inc:
    //       likeStatus === 'Dislike'
    //         ? { 'extendedLikesInfo.dislikesCount': -1 }
    //         : { 'extendedLikesInfo.likesCount': -1 },
    //   },
    // );
  }

  async findPostByBlogId(blogId: string) {
    try {
		const query = `
			select * 
				from "Posts"
				where "blogId" = $1
		`
      const post = (await this.dataSource.query(query, [blogId]))[0]
      return post;
    } catch (error) {
      return null;
    }
  }

  async findNewestLike(postId: string) {
	try{
		const query = `
			select *
				from "NewestLike"
				where "postId" = $1
		`
		const findNewestLike = (await this.dataSource.query(query, [postId]))[0]
		return findNewestLike
	} catch(erro) {
		return null
	}
  }

  async findPostByIdAndBlogId(id: string, blogId: string) {
	const query = `
		select *
			from "Posts"
			where "id" = $1 and "blogId" = $2
	`
	const findPostById = (await this.dataSource.query(query, [id, blogId]))[0]
	return findPostById
  }

  async findPostById(id: string) {
	const query = `
		select *
			from "Posts"
			where "id" = $1
	`
	const findPostById = (await this.dataSource.query(query, [id]))[0]
	return findPostById
  }
}
