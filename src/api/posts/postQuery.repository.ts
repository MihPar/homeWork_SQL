import { Injectable } from '@nestjs/common';
import { PaginationType } from '../../types/pagination.types';
import { PostsViewModel } from './posts.type';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { PostClass, Posts } from './post.class';
import { LikeStatusEnum } from '../likes/likes.emun';


@Injectable()
export class PostsQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  //   async findPostById(postId: string, userId?: string | null): Promise<PostsViewModel | null> {
  //     if(!ObjectId.isValid(postId)) return null;
  // 	const post: PostClass | null = await this.postModel
  //       .findOne({ _id: new ObjectId(postId) }, { __v: 0 })
  //       .lean();

  //     const newestLikes = await this.likeModel
  //       .find({ postId: postId, myStatus: LikeStatusEnum.Like })
  //       .sort({ addedAt: -1 })
  //       .limit(3)
  //       .skip(0)
  //       .lean();

  //     let myStatus: LikeStatusEnum = LikeStatusEnum.None;

  //     if (userId) {
  //       const reaction = await this.likeModel.findOne({
  //         postId: postId,
  //         userId,
  //       });
  //       myStatus = reaction
  //         ? (reaction.myStatus as unknown as LikeStatusEnum)
  //         : LikeStatusEnum.None;
  //     }
  //     return post ? PostClass.getPostsViewModel(post, myStatus, newestLikes) : null;
  //   }

  //   async findAllPosts(
  //     pageNumber: string,
  //     pageSize: string,
  //     sortBy: string,
  //     sortDirection: string,
  //     userId?: string | null,
  //   ): Promise<PaginationType<Posts>> {
  //     const filtered = {};
  //     const allPosts: PostClass[] = await this.postModel
  //       .find(filtered, { __v: 0 })
  //       .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
  //       .skip((+pageNumber - 1) * +pageSize)
  //       .limit(+pageSize)
  //       .lean();

  //     const totalCount: number = await this.postModel.countDocuments(filtered);
  //     const pagesCount: number = Math.ceil(totalCount / +pageSize);

  //     let result: PaginationType<Posts> = {
  //       pagesCount: pagesCount,
  //       page: +pageNumber,
  //       pageSize: +pageSize,
  //       totalCount: totalCount,
  //       items: await Promise.all(
  //         allPosts.map(async (post) => {
  //           const newestLikes = await this.likeModel
  //             .find({
  //               postId: post._id.toString(),
  //               myStatus: LikeStatusEnum.Like,
  //             })
  //             .sort({ addedAt: -1 })
  //             .limit(3)
  //             .skip(0)
  //             .lean();

  //           let myStatus: LikeStatusEnum = LikeStatusEnum.None;

  //           if (userId) {
  //             const reaction = await this.likeModel
  //               .findOne(
  //                 {
  //                   postId: post._id.toString(),
  //                   userId: userId,
  //                 },
  //                 { __v: 0 },
  //               )
  //               .lean();

  //             myStatus = reaction
  //               ? (reaction.myStatus as unknown as LikeStatusEnum)
  //               : LikeStatusEnum.None;
  //           }
  //           return PostClass.getPostsViewModel(post, myStatus, newestLikes);
  //         }),
  //       ),
  //     };
  //     return result;
  //   }

  async findPostsByBlogsId(
    pageNumber: string,
    pageSize: string,
    sortBy: string,
    sortDirection: string,
    blogId: string,
    userId: string | null
  ): Promise<PaginationType<Posts>> {

    const query1 = `
		SELECT *
			FROM public."Posts"
			WHERE "blogId" = $1
			ORDER BY $2 ${sortDirection}
			LIMIT $3 OFFSET $4
	`;
    const findPostsByBlogId = await this.dataSource.query(query1, [
      blogId,
      sortBy,
      +pageSize,
      (+pageNumber - 1) * +pageSize,
    ]);

    const count = `
  		SELECT count(*)
  			FROM public."Posts"
  			WHERE "blogId" = $1
  `;
    const totalCount = (await this.dataSource.query(count, [blogId]))[0].count;
    const pagesCount: number = Math.ceil(totalCount / +pageSize);

	const query2 = `
			select *
				from "NewestLikes"
				where "postId" = $1
		`;

    const result: PaginationType<Posts> = {
      pagesCount: pagesCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount,
      items: findPostsByBlogId.map(async function (post: PostClass) {
        const newestLike = (await this.dataSource.query(query2, [post.id]))[0];
        return PostClass.getPostsViewModel(post, newestLike);
      }),
    };
    return result;
  }
}