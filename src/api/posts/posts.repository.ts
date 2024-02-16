import { Injectable } from '@nestjs/common';
import { LikeStatusEnum } from '../../api/likes/likes.emun';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostClass } from './post.class';
import { NewestLikesClass } from '../likes/likes.class';

@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createNewPosts(newPost: PostClass): Promise<PostClass | null> {
    try {
      const query = `
			INSERT INTO public."Posts"(
				"blogId", "title", "shortDescription", "content", "blogName", "createdAt", "likesCount", "dislikesCount")
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
				returning *
		`;
      const resultNewPost = (
        await this.dataSource.query(query, [
          newPost.blogId,
          newPost.title,
          newPost.shortDescription,
          newPost.content,
          newPost.blogName,
          newPost.createdAt,
          newPost.likesCount,
          newPost.dislikesCount,
        ])
      )[0];

      return resultNewPost;
    } catch (error) {
      console.log(error, "error in create post");
      return null;
    }
  }

  async updatePost(newPost: PostClass, id: string): Promise<PostClass> {
    const query = `
		UPDATE public."Posts"
			SET "blogId"=$1, "title"=$2, "shortDescription"=$3, "content"=$4, "blogName"=$5, "createdAt"=$6, "likesCount"=$7, "dislikesCount"=$8, "myStatus"=$9
			WHERE "id" = $10
			returning *
	`;
    const result = (
      await this.dataSource.query(query, [
        newPost.blogId,
        newPost.title,
        newPost.shortDescription,
		newPost.content,
		newPost.blogName,
		newPost.createdAt,
		newPost.likesCount,
		newPost.dislikesCount,
		newPost.myStatus,
        id,
      ])
    )[0];
    return result[0];
  }

  async deletedPostByIdWithBlogId(
    id: string,
    blogId: string
  ): Promise<boolean> {
    const query = `
		delete from "Posts"
			where "id" = $1 and "blogId" = $2
	`;
    const result = await this.dataSource.query(query, [id, blogId]);
    if (!result) return false;
    return true;
  }

  async deleteRepoPosts() {
    await this.dataSource.query(`
		DELETE FROM public."Posts"
	`);
    return true;
  }

  async increase(postId: string, likeStatus: string) {
    if (likeStatus === LikeStatusEnum.None) {
      return;
    } else if (likeStatus === "Dislike") {
      let dislike = "Dislike";
      const query = `
			UPDATE public."Posts"
				SET "likesCount"=${1}
				WHERE "id" = $1 AND "myStatus" = ${dislike}
		`;
      return (await this.dataSource.query(query, [postId]))[0]
    } else {
      let like = "Like";
      const query = `
			UPDATE public."Posts"
				SET "dislikesCount"=${1}
				WHERE "id" = $1 AND "myStatus" = ${like}
		`;
      return (await this.dataSource.query(query, [postId]))[0]
    }
  }

  async decrease(postId: string, likeStatus: string) {
    if (likeStatus === LikeStatusEnum.None) {
      return;
    } else if (likeStatus === "Dislike") {
      let dislike = "Dislike";
      const query = `
			UPDATE public."Posts"
				SET "likesCount"=${-1}
				WHERE "id" = $1 AND "myStatus" = ${dislike}
		`;
      return (await this.dataSource.query(query, [postId]))[0]
    } else {
      let like = "Like";
      const query = `
			UPDATE public."Posts"
				SET "dislikesCount"=${-1}
				WHERE "id" = $1 AND "myStatus" = ${like}
		`;
      return (await this.dataSource.query(query, [postId]))[0]
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
		`;
      const post = (await this.dataSource.query(query, [blogId]))[0];
      return post;
    } catch (error) {
      return null;
    }
  }

  async findNewestLike(id: string) {
    try {
      const query = `
			select *
				from public."NewestLikes"
				where "postId" = $1
		`;
      const findNewestLike = (await this.dataSource.query(query, [id]))[0];
      return findNewestLike;
    } catch (erro) {
      return null;
    }
  }

  async findPostByIdAndBlogId(id: string, blogId: string) {
    const query = `
		select *
			from "Posts"
			where "id" = $1 and "blogId" = $2
	`;
    const findPostById = (await this.dataSource.query(query, [id, blogId]))[0];
    return findPostById;
  }

  async findPostById(id: string) {
    const query = `
		select *
			from "Posts"
			where "id" = $1
	`;
    const findPostById = (await this.dataSource.query(query, [id]))[0];
    return findPostById;
  }

  async createNewestLikes(newest: NewestLikesClass) {
    const query = `
		INSERT INTO public."NewestLikes"(
			"addedAt", "userId", "login", "postId", "myStatus")
			VALUES ($1, $2, $3, $4)
			returning *
	`;
    const createNewest = (
      await this.dataSource.query(query, [
        newest.addedAT,
        newest.userId,
        newest.login,
        newest.postId,
		newest.myStatus
      ])
    )[0];
	return createNewest
  }
}
